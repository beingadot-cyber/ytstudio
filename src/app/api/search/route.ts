import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, comments } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { like, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const videoResults = await db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        type: sql<string>`'video'`,
      })
      .from(videos)
      .where(or(like(videos.title, `%${q}%`), like(videos.description, `%${q}%`)))
      .limit(5);

    const commentResults = await db
      .select({
        id: comments.id,
        text: comments.text,
        author: comments.author,
        videoId: comments.videoId,
        type: sql<string>`'comment'`,
      })
      .from(comments)
      .where(or(like(comments.text, `%${q}%`), like(comments.author, `%${q}%`)))
      .limit(5);

    return NextResponse.json({
      results: [
        ...videoResults.map((v) => ({
          id: v.id,
          title: v.title,
          subtitle: "Video",
          href: `/content/${v.id}`,
          type: "video",
          thumbnail: v.thumbnailUrl,
        })),
        ...commentResults.map((c) => ({
          id: c.id,
          title: c.text.substring(0, 60) + (c.text.length > 60 ? "..." : ""),
          subtitle: `Comment by ${c.author}`,
          href: `/comments`,
          type: "comment",
        })),
      ],
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
