import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { revenue, videos, videoAnalytics, dailyAnalytics } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { sql, gte, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "28d";

    const daysMap: Record<string, number> = { "7d": 7, "28d": 28, "90d": 90, "365d": 365 };
    const days = daysMap[range] ?? 28;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Total revenue
    const [totals] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${videoAnalytics.revenue}), 0)`,
        totalViews: sql<number>`COALESCE(SUM(${videoAnalytics.views}), 0)`,
      })
      .from(videoAnalytics);

    // Period revenue
    const [periodRevenue] = await db
      .select({
        amount: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        views: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
      })
      .from(dailyAnalytics)
      .where(gte(dailyAnalytics.date, startDateStr));

    // Daily revenue chart
    const chartData = await db
      .select({
        date: dailyAnalytics.date,
        revenue: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        views: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
      })
      .from(dailyAnalytics)
      .where(gte(dailyAnalytics.date, startDateStr))
      .groupBy(dailyAnalytics.date)
      .orderBy(dailyAnalytics.date);

    // Revenue by video
    const byVideo = await db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        views: videoAnalytics.views,
        revenue: videoAnalytics.revenue,
      })
      .from(videos)
      .leftJoin(videoAnalytics, sql`${videos.id} = ${videoAnalytics.videoId}`)
      .orderBy(desc(videoAnalytics.revenue))
      .limit(20);

    const totalRev = Number(totals.totalRevenue);
    const totalViews = Number(totals.totalViews);
    const rpm = totalViews > 0 ? (totalRev / totalViews) * 1000 : 0;

    const topEarning = byVideo[0] ?? null;

    return NextResponse.json({
      summary: {
        totalRevenue: totalRev,
        periodRevenue: Number(periodRevenue.amount),
        rpm: Math.round(rpm),
        topEarning: topEarning ? {
          id: topEarning.id,
          title: topEarning.title,
          revenue: Number(topEarning.revenue ?? 0),
        } : null,
      },
      chartData,
      byVideo: byVideo.map((v) => ({
        ...v,
        views: Number(v.views ?? 0),
        revenue: Number(v.revenue ?? 0),
        rpm: (v.views && Number(v.views) > 0)
          ? Math.round((Number(v.revenue ?? 0) / Number(v.views)) * 1000)
          : 0,
      })),
    });
  } catch (error) {
    console.error("Revenue error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
