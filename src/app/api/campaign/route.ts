/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectDB";
import Company from "@/models/Company";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const campaignId = req.nextUrl.searchParams.get("campaignId");
    const companyId = req.nextUrl.searchParams.get("companyId");
    
    if (!campaignId || !companyId) {
      return NextResponse.json({ error: "campaignId and companyId are required" }, { status: 400 });
    }

    await connectMongo();

    const company = await Company.findOne({ companyId }).select('campaigns').lean();
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Find the specific campaign
    const campaigns = (company as any).campaigns || [];
    const campaign = campaigns.find((c: any) => c.campaignId === campaignId);
    
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (err) {
    console.error("GET /api/campaign error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}