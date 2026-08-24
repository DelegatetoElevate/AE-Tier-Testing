# AE Tier Testing

Web app for Allen Elliott Fitness quarterly tier testing.

- **Next.js app** (root) — the real app, backed by Supabase.
- **`/prototype`** — the original self-contained HTML prototype, kept for reference.

## Status
Slice 1: real magic-link login + live Leaderboard reading from Supabase.
Other screens (log a test, approvals, member management) are placeholders,
being built next.

## Setup
Environment variables (set in Vercel, not committed):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
