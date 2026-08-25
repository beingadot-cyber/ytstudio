import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    // Seed on startup if needed
    try {
      await seedDatabase();
    } catch (seedError) {
      console.error("Seed error (non-fatal):", seedError);
    }
    return Response.json({ ok: true, app: "Creator Studio Demo" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
