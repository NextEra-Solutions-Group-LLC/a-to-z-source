# AtoZSource - Private Members Portal

Next.js + TypeScript + Tailwind v4. Login is server-side (signed httpOnly cookie);
list, prices and contact details are only returned by `/api/private` for a valid session.

## Run
1. `npm install`
2. `cp .env.example .env.local` and set SESSION_SECRET, MEMBERS, CONTACT_PHONE, CONTACT_EMAIL
3. `npm run dev` (dev only: if MEMBERS is empty, member@atozsource.com / AtoZ-Demo-2026 works)

## Edit private content
Items and prices live in `src/app/api/private/route.ts` (sample data - replace before launch).
