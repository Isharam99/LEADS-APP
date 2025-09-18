/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectDB";
import Leed from "@/models/Leed";

/**
 * POST /api/leed
 * Body:
 * {
 *   companyId?: string      // optional if middleware injects user header with companyId
 *   campaignId: string
 *   content: object
 *   WhatsApp?: string       // default "N/A"
 *   previousSite?: string   // default "N/A"
 *   createdTime?: string|number|Date
 *   badges?: string[]       // default ["new"]
 *   priority?: number       // 1..5 default 3
 *   lastContactedAt?: string|number|Date|null
 *   contactAttempts?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Make sure connection pool is ready (no-op after first connect)
    await connectMongo();

    // Parse body ASAP
    const body = await req.json();

    // Fast-path: pull companyId from header user payload if not provided (your middleware sets this)
    let companyId: string | undefined = body.companyId;
    if (!companyId) {
      const userHeader = req.headers.get("user");
      if (userHeader) {
        try {
          const u = JSON.parse(userHeader);
          if (u?.companyId) companyId = String(u.companyId);
        } catch {}
      }
    }

    const campaignId = String(body.campaignId || "").trim();
    const content = body.content;

    if (!companyId || !campaignId || typeof content === "undefined") {
      return NextResponse.json(
        { error: "companyId, campaignId and content are required" },
        { status: 400 }
      );
    }

    // Minimal normalization (keep it fast)
    const now = Date.now();
    const toDate = (v: any): Date | null => (v ? new Date(v) : null);

    const payload: any = {
      companyId,
      campaignId,
      content, // Mixed — accept as-is for speed
      WhatsApp: body.WhatsApp ?? "N/A",
      previousSite: body.previousSite ?? "N/A",
      createdTime: body.createdTime
        ? new Date(body.createdTime)
        : new Date(now),
      badges:
        Array.isArray(body.badges) && body.badges.length
          ? body.badges
          : ["new"],
      priority:
        typeof body.priority === "number"
          ? Math.min(5, Math.max(1, body.priority))
          : 3,
      lastContactedAt: toDate(body.lastContactedAt),
      contactAttempts:
        typeof body.contactAttempts === "number" && body.contactAttempts >= 0
          ? body.contactAttempts
          : 0,
    };

    // Fast insert (no extra reads)
    const doc = await Leed.create(payload);

    // Tiny response for throughput
    return NextResponse.json(
      { ok: true, id: String(doc._id), createdTime: doc.createdTime },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Error in POST /api/leed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    // --- Auth / tenant scope ---
    const userHeader = req.headers.get("user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = JSON.parse(userHeader);

    // companyId: owners/moderators use their own; ultra-admin can override via ?companyId=
    let companyId: string | null = user.companyId ?? null;
    if (user.role === "ultra-admin") {
      companyId = req.nextUrl.searchParams.get("companyId") || companyId;
    }

    const campaignId = req.nextUrl.searchParams.get("campaignId");

    if (!companyId || !campaignId) {
      return NextResponse.json(
        { error: "companyId and campaignId are required" },
        { status: 400 }
      );
    }

    // --- Query params / defaults ---
    const startDateRaw =
      req.nextUrl.searchParams.get("startDate") || "1960-01-01";
    const endDateRaw =
      req.nextUrl.searchParams.get("endDate") ||
      new Date().toISOString().split("T")[0];
    const query = (req.nextUrl.searchParams.get("query") || "").trim();

    // createdTime range (business time)
    const startDate = new Date(startDateRaw);
    const endDate = new Date(new Date(endDateRaw).setHours(23, 59, 59, 999));

    // pagination
    const countRaw = req.nextUrl.searchParams.get("count") || "20";
    const pageRaw = req.nextUrl.searchParams.get("page") || "1";
    const count = Math.max(1, Math.min(100, parseInt(countRaw, 10) || 20));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);

    // sorting (allowlist to avoid unindexed sorts/injection)
    const sortByRaw = (
      req.nextUrl.searchParams.get("sortBy") || "createdTime"
    ).trim();
    const sortOrderRaw = (
      req.nextUrl.searchParams.get("sortOrder") || "desc"
    ).trim();
    const ALLOWED_SORT = new Set([
      "createdTime",
      "createdAt",
      "updatedAt",
      "priority",
      "contactAttempts",
    ]);
    const sortBy = ALLOWED_SORT.has(sortByRaw) ? sortByRaw : "createdTime";
    const sortOrder = sortOrderRaw === "asc" ? 1 : -1;

    // badges
    let badgeList =
      req.nextUrl.searchParams
        .get("badgeList")
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    if (badgeList.length === 1 && badgeList[0] === "") badgeList = [];

    // --- Build filter ---
    const filter: any = {
      companyId,
      campaignId,
      createdTime: { $gte: startDate, $lte: endDate },
    };

    // badges filter (all required if provided)
    if (badgeList.length > 0) {
      filter.badges = { $all: badgeList };
    } else {
      filter.badges = { $exists: true };
    }

    // text-ish search over common fields inside `content`
    if (query) {
      filter.$or = [
        { "content.firstName": { $regex: query, $options: "i" } },
        { "content.lastName": { $regex: query, $options: "i" } },
        { "content.fullName": { $regex: query, $options: "i" } },
        { "content.name": { $regex: query, $options: "i" } },
        { "content.email": { $regex: query, $options: "i" } },
        { "content.phone": { $regex: query, $options: "i" } },
        { "content.phoneNumber": { $regex: query, $options: "i" } },
        { "content.whatsapp": { $regex: query, $options: "i" } },
        // fallback: stringify-able generic field often used
        { WhatsApp: { $regex: query, $options: "i" } },
        { previousSite: { $regex: query, $options: "i" } },
      ];
    }

    // --- Count + Page fetch ---
    const leedsCount = await Leed.countDocuments(filter);
    const pageCount = Math.max(1, Math.ceil(leedsCount / count));

    const leeds = await Leed.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(count)
      .skip((page - 1) * count)
      .lean();

    return NextResponse.json(
      {
        leeds,
        pageCount,
        leedsCount,
        startDate,
        endDate,
        count,
        sortBy,
        sortOrder: sortOrder === 1 ? "asc" : "desc",
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("GET /api/leed error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch leeds",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
