import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyAnalytics, videoAnalytics, videos } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { sql, gte, and } from "drizzle-orm";

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
    const prevDays = days * 2;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const prevStartDate = new Date();
    prevStartDate.setDate(prevStartDate.getDate() - prevDays);
    const prevStartDateStr = prevStartDate.toISOString().split("T")[0];

    // Current period
    const currentPeriod = await db
      .select({
        date: dailyAnalytics.date,
        views: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
        likes: sql<number>`COALESCE(SUM(${dailyAnalytics.likes}), 0)`,
        comments: sql<number>`COALESCE(SUM(${dailyAnalytics.comments}), 0)`,
        watchTime: sql<number>`COALESCE(SUM(${dailyAnalytics.watchTime}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        subscribersGained: sql<number>`COALESCE(SUM(${dailyAnalytics.subscribersGained}), 0)`,
      })
      .from(dailyAnalytics)
      .where(gte(dailyAnalytics.date, startDateStr))
      .groupBy(dailyAnalytics.date)
      .orderBy(dailyAnalytics.date);

    // Previous period
    const previousPeriod = await db
      .select({
        views: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
        likes: sql<number>`COALESCE(SUM(${dailyAnalytics.likes}), 0)`,
        comments: sql<number>`COALESCE(SUM(${dailyAnalytics.comments}), 0)`,
        watchTime: sql<number>`COALESCE(SUM(${dailyAnalytics.watchTime}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        subscribersGained: sql<number>`COALESCE(SUM(${dailyAnalytics.subscribersGained}), 0)`,
      })
      .from(dailyAnalytics)
      .where(
        and(
          gte(dailyAnalytics.date, prevStartDateStr),
          sql`${dailyAnalytics.date} < ${startDateStr}`
        )
      );

    // Current totals
    const currentTotals = currentPeriod.reduce(
      (acc, d) => ({
        views: acc.views + Number(d.views),
        likes: acc.likes + Number(d.likes),
        comments: acc.comments + Number(d.comments),
        watchTime: acc.watchTime + Number(d.watchTime),
        revenue: acc.revenue + Number(d.revenue),
        subscribers: acc.subscribers + Number(d.subscribersGained),
      }),
      { views: 0, likes: 0, comments: 0, watchTime: 0, revenue: 0, subscribers: 0 }
    );

    const prevTotals = {
      views: Number(previousPeriod[0]?.views ?? 0),
      likes: Number(previousPeriod[0]?.likes ?? 0),
      comments: Number(previousPeriod[0]?.comments ?? 0),
      watchTime: Number(previousPeriod[0]?.watchTime ?? 0),
      revenue: Number(previousPeriod[0]?.revenue ?? 0),
      subscribers: Number(previousPeriod[0]?.subscribersGained ?? 0),
    };

    const calcChange = (curr: number, prev: number) =>
      prev === 0 ? 100 : Number((((curr - prev) / prev) * 100).toFixed(1));

    // Top videos
    const topVideos = await db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        views: videoAnalytics.views,
        likes: videoAnalytics.likes,
        watchTime: videoAnalytics.watchTime,
        revenue: videoAnalytics.revenue,
      })
      .from(videos)
      .leftJoin(videoAnalytics, sql`${videos.id} = ${videoAnalytics.videoId}`)
      .orderBy(sql`${videoAnalytics.views} DESC`)
      .limit(5);

    return NextResponse.json({
      chartData: currentPeriod,
      current: currentTotals,
      previous: prevTotals,
      changes: {
        views: calcChange(currentTotals.views, prevTotals.views),
        likes: calcChange(currentTotals.likes, prevTotals.likes),
        comments: calcChange(currentTotals.comments, prevTotals.comments),
        watchTime: calcChange(currentTotals.watchTime, prevTotals.watchTime),
        revenue: calcChange(currentTotals.revenue, prevTotals.revenue),
        subscribers: calcChange(currentTotals.subscribers, prevTotals.subscribers),
      },
      topVideos,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
