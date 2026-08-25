import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "creator-studio-demo-fallback-secret"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: { userId: number; username: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; username: string; role: string };
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  // Demo mode: authentication is disabled. The seeded admin user (id 1)
  // is used for all dashboard/API operations so no login is required.
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    const user = await verifyToken(token);
    if (user) return user;
  }
  return { userId: 1, username: "admin", role: "admin" };
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }
  return user;
}
