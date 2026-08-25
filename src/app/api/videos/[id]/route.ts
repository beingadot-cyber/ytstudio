import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, videoAnalytics } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

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

    const [video] = await db
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
        updatedAt: videos.updatedAt,
        views: videoAnalytics.views,
        likes: videoAnalytics.likes,
        comments: videoAnalytics.comments,
        watchTime: videoAnalytics.watchTime,
        averageViewDuration: videoAnalytics.averageViewDuration,
        subscribersGained: videoAnalytics.subscribersGained,
        revenue: videoAnalytics.revenue,
      })
      .from(videos)
      .leftJoin(videoAnalytics, eq(videos.id, videoAnalytics.videoId))
      .where(eq(videos.id, videoId))
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Video GET error:", error);
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

    const {
      title, description, thumbnailUrl, videoUrl, category, tags,
      visibility, status, uploadDate, views, likes, comments,
      watchTime, averageViewDuration, subscribersGained, revenue,
    } = body;

    const [updated] = await db
      .update(videos)
      .set({
        title: title,
        description: description,
        thumbnailUrl: thumbnailUrl,
        videoUrl: videoUrl,
        category: category,
        tags: tags,
        visibility: visibility,
        status: status,
        uploadDate: uploadDate ? new Date(uploadDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, videoId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Update analytics if provided
    if (views !== undefined || likes !== undefined || comments !== undefined) {
      const existing = await db.select().from(videoAnalytics).where(eq(videoAnalytics.videoId, videoId)).limit(1);
      if (existing.length > 0) {
        await db.update(videoAnalytics).set({
          views: views ?? existing[0].views,
          likes: likes ?? existing[0].likes,
          comments: comments ?? existing[0].comments,
          watchTime: watchTime ?? existing[0].watchTime,
          averageViewDuration: averageViewDuration ?? existing[0].averageViewDuration,
          subscribersGained: subscribersGained ?? existing[0].subscribersGained,
          revenue: revenue ?? existing[0].revenue,
          updatedAt: new Date(),
        }).where(eq(videoAnalytics.videoId, videoId));
      } else {
        await db.insert(videoAnalytics).values({
          videoId,
          views: views ?? 0,
          likes: likes ?? 0,
          comments: comments ?? 0,
          watchTime: watchTime ?? 0,
          averageViewDuration: averageViewDuration ?? 0,
          subscribersGained: subscribersGained ?? 0,
          revenue: revenue ?? 0,
        });
      }
    }

    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.error("Video PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const [deleted] = await db.delete(videos).where(eq(videos.id, videoId)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
