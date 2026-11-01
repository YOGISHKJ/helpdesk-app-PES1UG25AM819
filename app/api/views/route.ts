// Yogish K J | PES1UG25AM819
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export async function GET() { return increment(); }
export async function POST() { return increment(); }

async function increment() {
  try {
    const redis = await getRedis();
    if (!redis) return NextResponse.json({ views: null });
    return NextResponse.json({ views: await redis.incr("help:views") });
  } catch { return NextResponse.json({ views: null }); }
}
