// Minimal signed-cookie session for the single shared admin/teacher password.
// Uses Web Crypto (available in both the Node runtime and Edge middleware)
// instead of a library, since there's only ever one "user" and no accounts.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE_NAME = "lanna_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(): Promise<string> {
  const key = await getKey();
  const payload = JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return false;
  try {
    const key = await getKey();
    const signatureValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64) as BufferSource,
      encoder.encode(payloadB64) as BufferSource
    );
    if (!signatureValid) return false;
    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64))) as { exp: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return input === expected;
}
