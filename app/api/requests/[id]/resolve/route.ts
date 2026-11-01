// Yogish K J | PES1UG25AM819
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getRedis } from "@/lib/redis";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ success: false, error: "Invalid request id" }, { status: 400 });
  try {
    const result = await pool.query("UPDATE help_requests SET resolved = true WHERE id = $1 RETURNING id", [Number(id)]);
    if (!result.rowCount) return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    try { const redis = await getRedis(); if (redis) await redis.del("help:latest"); } catch { /* Cache invalidation is best effort. */ }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: "Unable to resolve request" }, { status: 500 }); }
}
