import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COOKIE_NAME = "atoz_session";
const SESSION_SECONDS = 60 * 60 * 8; // 8 hours
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

// Very small in-memory throttle (per server instance) to slow down password guessing.
const attempts = new Map<string, { count: number; resetAt: number }>();

function sha(value: string) {
  return createHash("sha256").update(value).digest();
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") return null;
  return "dev-only-secret-change-me";
}

function getMembers(): { email: string; password: string }[] {
  const raw = process.env.MEMBERS;
  if (!raw) {
    if (process.env.NODE_ENV === "production") return [];
    // Local development fallback only.
    return [{ email: "member@atozsource.com", password: "AtoZ-Demo-2026" }];
  }
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf(":");
      return { email: pair.slice(0, i).trim().toLowerCase(), password: pair.slice(i + 1) };
    })
    .filter((m) => m.email && m.password);
}

function signSession(email: string, secret: string) {
  const payload = Buffer.from(
    JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function POST(request: Request) {
  const secret = getSecret();
  const members = getMembers();
  if (!secret || members.length === 0) {
    return NextResponse.json({ ok: false, error: "Login is not configured yet." }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Compare against every member without an early exit.
  let matched = false;
  for (const m of members) {
    const emailOk = timingSafeEqual(sha(m.email), sha(email));
    const passOk = timingSafeEqual(sha(m.password), sha(password));
    if (emailOk && passOk) matched = true;
  }

  if (!matched) {
    const fresh = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS };
    fresh.count += 1;
    attempts.set(ip, fresh);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, signSession(email, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
