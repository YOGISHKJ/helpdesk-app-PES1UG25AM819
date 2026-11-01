// Yogish K J | PES1UG25AM819
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const redis = await getRedis();
    if (redis) {
      try {
        const cached = await redis.get("help:latest");
        if (cached) return NextResponse.json({ source: "Redis", requests: JSON.parse(cached) });
      } catch { /* Treat Redis errors as cache misses. */ }
    }
    const result = await pool.query("SELECT id, student_name, message, created_at, resolved FROM help_requests ORDER BY created_at DESC LIMIT 10");
    if (redis) {
      try { await redis.set("help:latest", JSON.stringify(result.rows), { EX: 60 }); } catch { /* Cache is best effort. */ }
    }
    return NextResponse.json({ source: "PostgreSQL", requests: result.rows });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentName = typeof body.student_name === "string" ? body.student_name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!studentName || !message) return NextResponse.json({ success: false, error: "student_name and message are required" }, { status: 400 });
    if (studentName.length > 50 || message.length > 200) return NextResponse.json({ success: false, error: "student_name must be 50 characters or fewer and message must be 200 characters or fewer" }, { status: 400 });
    const result = await pool.query("INSERT INTO help_requests (student_name, message) VALUES ($1, $2) RETURNING id", [studentName, message]);
    try { const redis = await getRedis(); if (redis) await redis.del("help:latest"); } catch { /* PostgreSQL write already succeeded. */ }
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to post request" }, { status: 500 });
  }
}
