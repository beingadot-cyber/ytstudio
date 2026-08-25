import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videoAnalytics, dailyAnalytics } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, gte, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const videoId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "90d";

    const daysMap: Record<string, number> = { "7d": 7, "28d": 28, "90d": 90, "365d": 365 };
    const days = daysMap[range] ?? 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const [aggregate] = await db
      .select()
      .from(videoAnalytics)
      .where(eq(videoAnalytics.videoId, videoId))
      .limit(1);

    const daily = await db
      .select()
      .from(dailyAnalytics)
      .where(
        and(
          eq(dailyAnalytics.videoId, videoId),
          gte(dailyAnalytics.date, startDateStr)
        )
      )
      .orderBy(dailyAnalytics.date);

    return NextResponse.json({ aggregate, daily });
  } catch (error) {
    console.error("Video analytics GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const videoId = parseInt(id);
    const body = await request.json();

    const existing = await db
      .select()
      .from(videoAnalytics)
      .where(eq(videoAnalytics.videoId, videoId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(videoAnalytics).values({ videoId, ...body });
    } else {
      await db
        .update(videoAnalytics)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(videoAnalytics.videoId, videoId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video analytics PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
