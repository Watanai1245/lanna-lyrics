import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionToken, verifySessionToken } from "@/lib/auth";

export async function setAdminSession(): Promise<void> {
  const token = await createSessionToken();
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSession(): void {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function requireAdmin(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    throw new Error("Unauthorized");
  }
}
