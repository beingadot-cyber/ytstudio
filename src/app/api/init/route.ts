import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database initialized successfully" });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database initialized successfully" });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
  }
}
