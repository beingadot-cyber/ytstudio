import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, videoAnalytics } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { sql, like, or, eq, desc, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const filter = searchParams.get("filter") ?? "all";
    const sortBy = searchParams.get("sortBy") ?? "uploadDate";
    const sortOrder = searchParams.get("sortOrder") ?? "desc";
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        thumbnailUrl: videos.thumbnailUrl,
        videoUrl: videos.videoUrl,
        category: videos.category,
        tags: videos.tags,
        visibility: videos.visibility,
        status: videos.status,
        uploadDate: videos.uploadDate,
        createdAt: videos.createdAt,
        views: videoAnalytics.views,
        likes: videoAnalytics.likes,
        comments: videoAnalytics.comments,
        watchTime: videoAnalytics.watchTime,
        revenue: videoAnalytics.revenue,
        subscribersGained: videoAnalytics.subscribersGained,
        averageViewDuration: videoAnalytics.averageViewDuration,
      })
      .from(videos)
      .leftJoin(videoAnalytics, eq(videos.id, videoAnalytics.videoId))
      .$dynamic();

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(videos.title, `%${search}%`),
          like(videos.description, `%${search}%`)
        )
      );
    }

    if (filter !== "all") {
      conditions.push(eq(videos.status, filter));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0]! : sql`${conditions[0]} AND ${conditions[1]}`);
    }

    const sortColumn = sortBy === "views" ? videoAnalytics.views
      : sortBy === "likes" ? videoAnalytics.likes
      : sortBy === "revenue" ? videoAnalytics.revenue
      : videos.uploadDate;

    if (sortOrder === "asc") {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }

    const [totalCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(videos);

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json({
      videos: results,
      pagination: {
        page,
        limit,
        total: Number(totalCount.count),
        totalPages: Math.ceil(Number(totalCount.count) / limit),
      },
    });
  } catch (error) {
    console.error("Videos GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, description, thumbnailUrl, videoUrl, category, tags,
      visibility, status, uploadDate, views, likes, comments,
      watchTime, averageViewDuration, subscribersGained, revenue,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [video] = await db.insert(videos).values({
      title,
      description: description ?? "",
      thumbnailUrl: thumbnailUrl ?? null,
      videoUrl: videoUrl ?? null,
      category: category ?? null,
      tags: tags ?? [],
      visibility: visibility ?? "public",
      status: status ?? "published",
      uploadDate: uploadDate ? new Date(uploadDate) : new Date(),
    }).returning();

    await db.insert(videoAnalytics).values({
      videoId: video.id,
      views: views ?? 0,
      likes: likes ?? 0,
      comments: comments ?? 0,
      watchTime: watchTime ?? 0,
      averageViewDuration: averageViewDuration ?? 0,
      subscribersGained: subscribersGained ?? 0,
      revenue: revenue ?? 0,
    });

    return NextResponse.json({ success: true, video }, { status: 201 });
  } catch (error) {
    console.error("Videos POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
