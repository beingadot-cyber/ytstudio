import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, videoAnalytics, dailyAnalytics, comments, settings } from "@/db/schema";
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

    const daysMap: Record<string, number> = {
      "7d": 7, "28d": 28, "90d": 90, "365d": 365,
    };
    const days = daysMap[range] ?? 28;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Total aggregate stats
    const [totals] = await db
      .select({
        totalViews: sql<number>`COALESCE(SUM(${videoAnalytics.views}), 0)`,
        totalLikes: sql<number>`COALESCE(SUM(${videoAnalytics.likes}), 0)`,
        totalComments: sql<number>`COALESCE(SUM(${videoAnalytics.comments}), 0)`,
        totalWatchTime: sql<number>`COALESCE(SUM(${videoAnalytics.watchTime}), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(${videoAnalytics.revenue}), 0)`,
        totalSubscribersGained: sql<number>`COALESCE(SUM(${videoAnalytics.subscribersGained}), 0)`,
      })
      .from(videoAnalytics);

    // Period stats from daily_analytics
    const [periodStats] = await db
      .select({
        periodViews: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
        periodLikes: sql<number>`COALESCE(SUM(${dailyAnalytics.likes}), 0)`,
        periodComments: sql<number>`COALESCE(SUM(${dailyAnalytics.comments}), 0)`,
        periodWatchTime: sql<number>`COALESCE(SUM(${dailyAnalytics.watchTime}), 0)`,
        periodRevenue: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        periodSubs: sql<number>`COALESCE(SUM(${dailyAnalytics.subscribersGained}), 0)`,
      })
      .from(dailyAnalytics)
      .where(gte(dailyAnalytics.date, startDateStr));

    // Daily chart data
    const chartData = await db
      .select({
        date: dailyAnalytics.date,
        views: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
        likes: sql<number>`COALESCE(SUM(${dailyAnalytics.likes}), 0)`,
        comments: sql<number>`COALESCE(SUM(${dailyAnalytics.comments}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        watchTime: sql<number>`COALESCE(SUM(${dailyAnalytics.watchTime}), 0)`,
        subscribersGained: sql<number>`COALESCE(SUM(${dailyAnalytics.subscribersGained}), 0)`,
      })
      .from(dailyAnalytics)
      .where(gte(dailyAnalytics.date, startDateStr))
      .groupBy(dailyAnalytics.date)
      .orderBy(dailyAnalytics.date);

    // Total video count
    const [videoCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(videos);

    // Recent videos with analytics
    const recentVideos = await db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        visibility: videos.visibility,
        status: videos.status,
        uploadDate: videos.uploadDate,
        views: videoAnalytics.views,
        likes: videoAnalytics.likes,
        comments: videoAnalytics.comments,
        revenue: videoAnalytics.revenue,
      })
      .from(videos)
      .leftJoin(videoAnalytics, sql`${videos.id} = ${videoAnalytics.videoId}`)
      .orderBy(sql`${videos.uploadDate} DESC`)
      .limit(10);

    // Subscriber count from settings
    const [subSetting] = await db
      .select()
      .from(settings)
      .where(sql`${settings.key} = 'total_subscribers'`)
      .limit(1);

    const totalSubscribers = parseInt(subSetting?.value ?? "248000", 10);

    return NextResponse.json({
      totals: {
        views: Number(totals.totalViews),
        likes: Number(totals.totalLikes),
        comments: Number(totals.totalComments),
        watchTime: Number(totals.totalWatchTime),
        revenue: Number(totals.totalRevenue),
        subscribersGained: Number(totals.totalSubscribersGained),
        subscribers: totalSubscribers,
        videoCount: Number(videoCount.count),
      },
      period: {
        views: Number(periodStats.periodViews),
        likes: Number(periodStats.periodLikes),
        comments: Number(periodStats.periodComments),
        watchTime: Number(periodStats.periodWatchTime),
        revenue: Number(periodStats.periodRevenue),
        subscribers: Number(periodStats.periodSubs),
      },
      chartData,
      recentVideos,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
