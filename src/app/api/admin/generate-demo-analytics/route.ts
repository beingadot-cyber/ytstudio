import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyAnalytics, videoAnalytics, revenue } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, and, between, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      videoId,
      startDate,
      endDate,
      startViews,
      endViews,
      startLikes,
      endLikes,
      startComments,
      endComments,
      startRevenue,
      endRevenue,
    } = body;

    if (!videoId || !startDate || !endDate) {
      return NextResponse.json({ error: "videoId, startDate, endDate are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return NextResponse.json({ error: "endDate must be after startDate" }, { status: 400 });
    }

    // Delete existing daily analytics for this video in this range
    await db.delete(dailyAnalytics).where(
      and(
        eq(dailyAnalytics.videoId, videoId),
        between(dailyAnalytics.date, startDate, endDate)
      )
    );

    // Also delete revenue for this range
    await db.delete(revenue).where(
      and(
        eq(revenue.videoId, videoId),
        between(revenue.date, startDate, endDate)
      )
    );

    const totalViews = (endViews ?? 0) - (startViews ?? 0);
    const totalLikes = (endLikes ?? 0) - (startLikes ?? 0);
    const totalComments = (endComments ?? 0) - (startComments ?? 0);
    const totalRevenue = (endRevenue ?? 0) - (startRevenue ?? 0);

    const dailyRows = [];
    const revenueRows = [];
    let cumViews = startViews ?? 0;
    let cumLikes = startLikes ?? 0;
    let cumComments = startComments ?? 0;
    let cumRevenue = startRevenue ?? 0;

    for (let i = 0; i < totalDays; i++) {
      const dateObj = new Date(start);
      dateObj.setDate(dateObj.getDate() + i);
      const dateStr = dateObj.toISOString().split("T")[0];

      const progress = (i + 1) / totalDays;
      // Slightly randomize each day
      const noise = 0.8 + Math.random() * 0.4;

      const dayViews = Math.max(0, Math.floor((totalViews / totalDays) * noise));
      const dayLikes = Math.max(0, Math.floor((totalLikes / totalDays) * noise));
      const dayComments = Math.max(0, Math.floor((totalComments / totalDays) * noise));
      const dayRevenue = Math.max(0, Math.round((totalRevenue / totalDays) * noise));

      cumViews += dayViews;
      cumLikes += dayLikes;
      cumComments += dayComments;
      cumRevenue += dayRevenue;

      dailyRows.push({
        videoId,
        date: dateStr,
        views: dayViews,
        likes: dayLikes,
        comments: dayComments,
        watchTime: Math.floor(dayViews * 7), // ~7 min avg
        revenue: dayRevenue,
        subscribersGained: Math.floor(dayViews * 0.001),
      });

      if (dayRevenue > 0) {
        revenueRows.push({
          videoId,
          date: dateStr,
          amount: dayRevenue,
          source: "ads" as const,
        });
      }
    }

    if (dailyRows.length > 0) {
      await db.insert(dailyAnalytics).values(dailyRows);
    }
    if (revenueRows.length > 0) {
      await db.insert(revenue).values(revenueRows);
    }

    // Recalculate aggregate from all daily
    const [newTotals] = await db
      .select({
        views: sql<number>`COALESCE(SUM(${dailyAnalytics.views}), 0)`,
        likes: sql<number>`COALESCE(SUM(${dailyAnalytics.likes}), 0)`,
        comments: sql<number>`COALESCE(SUM(${dailyAnalytics.comments}), 0)`,
        watchTime: sql<number>`COALESCE(SUM(${dailyAnalytics.watchTime}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${dailyAnalytics.revenue}), 0)`,
        subscribersGained: sql<number>`COALESCE(SUM(${dailyAnalytics.subscribersGained}), 0)`,
      })
      .from(dailyAnalytics)
      .where(eq(dailyAnalytics.videoId, videoId));

    await db.update(videoAnalytics)
      .set({
        views: Number(newTotals.views),
        likes: Number(newTotals.likes),
        comments: Number(newTotals.comments),
        watchTime: Number(newTotals.watchTime),
        revenue: Number(newTotals.revenue),
        subscribersGained: Number(newTotals.subscribersGained),
        updatedAt: new Date(),
      })
      .where(eq(videoAnalytics.videoId, videoId));

    return NextResponse.json({
      success: true,
      generated: {
        days: totalDays,
        totalViews: cumViews,
        totalRevenue: cumRevenue,
      },
    });
  } catch (error) {
    console.error("Generate demo analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
