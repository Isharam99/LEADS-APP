// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import Leed from "@/models/Leed";


export const runtime = "nodejs"; // Important: mongoose needs Node runtime
export const dynamic = "force-dynamic"; // Avoid static caching


const LeadSchema = z.object({
companyId: z.string().min(1),
campaignId: z.string().min(1),
WhatsApp: z.string().optional(),
previousSite: z.string().optional(),
createdTime: z.coerce.date().optional(),
badges: z.array(z.string()).optional(),
priority: z.coerce.number().min(1).max(5).optional(),
lastContactedAt: z.coerce.date().nullable().optional(),
contactAttempts: z.coerce.number().int().min(0).optional(),
// Accept any JSON for content; form sends string -> try JSON.parse fall back to string
content: z.any(),
});


export async function GET() {
try {
await connectToDB();
const leads = await Leed.find().sort({ createdAt: -1 }).limit(50).lean();
return NextResponse.json({ ok: true, data: leads });
} catch (err: any) {
return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
}
}


export async function POST(req: NextRequest) {
try {
await connectToDB();
const raw = await req.json();


// Try to parse content if it arrived as a stringified JSON
if (typeof raw.content === "string") {
try { raw.content = JSON.parse(raw.content); } catch { /* keep as string */ }
}


const parsed = LeadSchema.safeParse(raw);
if (!parsed.success) {
return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
}


const doc = await Leed.create(parsed.data);
return NextResponse.json({ ok: true, data: doc }, { status: 201 });
} catch (err: any) {
return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
}
}