import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, videos } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { sql, eq, like, or, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const filter = searchParams.get("filter") ?? "all";
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(comments.text, `%${search}%`),
          like(comments.author, `%${search}%`)
        )
      );
    }
    if (filter !== "all") {
      conditions.push(eq(comments.status, filter));
    }

    let baseQuery = db
      .select({
        id: comments.id,
        videoId: comments.videoId,
        author: comments.author,
        authorAvatar: comments.authorAvatar,
        text: comments.text,
        likes: comments.likes,
        status: comments.status,
        isDemo: comments.isDemo,
        createdAt: comments.createdAt,
        videoTitle: videos.title,
        videoThumbnail: videos.thumbnailUrl,
      })
      .from(comments)
      .leftJoin(videos, eq(comments.videoId, videos.id))
      .$dynamic();

    if (conditions.length === 1) {
      baseQuery = baseQuery.where(conditions[0]!);
    } else if (conditions.length === 2) {
      baseQuery = baseQuery.where(and(conditions[0]!, conditions[1]!));
    }

    const results = await baseQuery
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(comments);

    return NextResponse.json({
      comments: results,
      pagination: {
        page,
        limit,
        total: Number(totalCount.count),
        totalPages: Math.ceil(Number(totalCount.count) / limit),
      },
    });
  } catch (error) {
    console.error("Comments GET error:", error);
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
    const { videoId, author, text, likes, status } = body;

    if (!videoId || !author || !text) {
      return NextResponse.json({ error: "videoId, author, and text are required" }, { status: 400 });
    }

    const [comment] = await db.insert(comments).values({
      videoId: parseInt(videoId),
      author,
      text,
      likes: likes ?? 0,
      status: status ?? "published",
      isDemo: true,
    }).returning();

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
