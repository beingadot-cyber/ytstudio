import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      channelName: users.channelName,
      channelDescription: users.channelDescription,
      avatarUrl: users.avatarUrl,
      currency: users.currency,
      theme: users.theme,
      role: users.role,
    }).from(users).where(eq(users.id, authUser.userId)).limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
