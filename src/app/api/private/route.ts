import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// MEMBERS-ONLY DATA. This only ever leaves the server for a verified session.
// NOTE: the items and prices below are SAMPLE placeholders - replace them with
// the real list and prices before launch.
// ---------------------------------------------------------------------------
const catalog = [
  {
    category: "Electronics",
    items: [
      { name: "Semiconductors & ICs", origin: "China", unit: "per 1,000 pcs", price: "USD 480" },
      { name: "Consumer Devices", origin: "Japan", unit: "per unit", price: "USD 112" },
      { name: "Battery & Power Systems", origin: "China", unit: "per kWh", price: "USD 95" },
    ],
  },
  {
    category: "Exotic Countertop",
    items: [
      { name: "Premium Marble Slabs", origin: "Turkey", unit: "per sq ft", price: "USD 38" },
      { name: "Quartzite Slabs", origin: "India", unit: "per sq ft", price: "USD 44" },
      { name: "Granite Slabs", origin: "India", unit: "per sq ft", price: "USD 21" },
    ],
  },
  {
    category: "Food",
    items: [
      { name: "Basmati Rice", origin: "India", unit: "per MT", price: "USD 980" },
      { name: "Spices & Seasonings", origin: "India", unit: "per MT", price: "USD 2,150" },
      { name: "Dried Fruits & Nuts", origin: "Turkey", unit: "per MT", price: "USD 3,400" },
    ],
  },
  {
    category: "Manpower",
    items: [
      { name: "Skilled Trades Staffing", origin: "India", unit: "per month", price: "USD 780" },
      { name: "Technical Engineers", origin: "UAE", unit: "per month", price: "USD 2,900" },
    ],
  },
  {
    category: "Real Estate",
    items: [
      { name: "Commercial Property Sourcing", origin: "UAE", unit: "per mandate", price: "On request" },
      { name: "Residential Investment Sourcing", origin: "UK", unit: "per mandate", price: "On request" },
    ],
  },
  {
    category: "Commercial Industrial Equipment",
    items: [
      { name: "CNC Machining Centers", origin: "Japan", unit: "per unit", price: "USD 48,000" },
      { name: "Packaging Lines", origin: "China", unit: "per line", price: "USD 36,500" },
    ],
  },
  {
    category: "Local & Global Logistics",
    items: [
      { name: "Sea Freight (FCL 40ft)", origin: "Global", unit: "per container", price: "USD 2,400" },
      { name: "Air Freight", origin: "Global", unit: "per kg", price: "USD 4.10" },
    ],
  },
  {
    category: "Building Materials",
    items: [
      { name: "Structural Steel", origin: "Turkey", unit: "per MT", price: "USD 690" },
      { name: "Ceramic & Porcelain Tiles", origin: "India", unit: "per sq m", price: "USD 7.80" },
    ],
  },
];

function verifySession(token: string | undefined): string | null {
  const secret =
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? null : "dev-only-secret-change-me");
  if (!token || !secret) return null;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      sub?: string;
      exp?: number;
    };
    if (!data.sub || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export async function GET() {
  const store = await cookies();
  const member = verifySession(store.get("atoz_session")?.value);
  const headers = { "Cache-Control": "no-store" };

  // Public visitors get nothing except the fact that they are not logged in.
  if (!member) {
    return NextResponse.json({ authenticated: false }, { headers });
  }

  return NextResponse.json(
    {
      authenticated: true,
      member,
      data: {
        catalog,
        contact: {
          phone: process.env.CONTACT_PHONE || "+1 (000) 000-0000",
          email: process.env.CONTACT_EMAIL || "inquiry@AtoZSource.com",
        },
      },
    },
    { headers },
  );
}
