import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, settings, videos, videoAnalytics, dailyAnalytics, comments, revenue } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, authUser.userId)).limit(1);
    const allSettings = await db.select().from(settings);

    return NextResponse.json({ user, settings: allSettings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, channelName, channelDescription, currency, theme } = body;

    const [updated] = await db
      .update(users)
      .set({
        displayName: displayName,
        channelName: channelName,
        channelDescription: channelDescription,
        currency: currency,
        theme: theme,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authUser.userId))
      .returning();

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "reset-analytics") {
      await db.update(videoAnalytics).set({
        views: 0, likes: 0, comments: 0, watchTime: 0,
        subscribersGained: 0, revenue: 0, updatedAt: new Date(),
      });
      await db.delete(dailyAnalytics);
      await db.delete(revenue);
      return NextResponse.json({ success: true, message: "Analytics reset" });
    }

    if (action === "delete-all") {
      await db.delete(comments);
      await db.delete(revenue);
      await db.delete(dailyAnalytics);
      await db.delete(videoAnalytics);
      await db.delete(videos);
      return NextResponse.json({ success: true, message: "All data deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
