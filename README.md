# AE Tier Testing

Web app for Allen Elliott Fitness quarterly tier testing.

- **`index.html`** (root) — the live app: Plan B (access-code + roster login), served statically. This is what's deployed on Vercel.
- **`/nextjs-app`** — the earlier Next.js + Supabase build (magic-link login). Preserved for reference; not currently deployed.
- **`/prototype`** — the original self-contained HTML prototype.

## Current status
Plan B demo: access-code login, roster, member management. Sample/in-browser
data for now (resets on refresh) — not yet wired to a live database.

Codes in the demo: `AEFIT` (athlete) · `COACH` (coach). Only coach: Allen Elliott.
