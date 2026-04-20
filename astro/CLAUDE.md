@AGENTS.md

# Astro — Personal Astrology Dashboard

Next.js 16 (App Router) personal astrology decision-support dashboard for Caroline.

## Tech stack

- **Next.js 16.2.4** with App Router, `cacheComponents: true` (enables `'use cache'` directive)
- **Tailwind v4** — CSS-based config via `@theme` in `app/globals.css`, no `tailwind.config.ts`
- **better-sqlite3** — synchronous SQLite at `astro.db` in project root
- **swisseph** — native ephemeris addon (Moshier/SEFLG_MOSEPH, no data files)
- **@anthropic-ai/sdk** — Claude API for interpretations and chat

## Key files

| Path | Purpose |
|------|---------|
| `lib/db.ts` | SQLite singleton; creates tables on startup |
| `lib/ephemeris.ts` | `calcTransits()`, `getUpcomingLunations()`, natal constants |
| `lib/now-data.ts` | Cached Claude interpretation helpers (`getInterpretation`, `getWhatsActiveInterpretation`, etc.) |
| `lib/houses-data.ts` | Static content for all 12 houses |
| `app/globals.css` | Tailwind `@theme` tokens + `animate-fade-up` keyframe |
| `components/Sidebar.tsx` | Desktop sidebar + mobile hamburger overlay |
| `components/PageTransition.tsx` | Fade-up wrapper keyed to pathname |
| `app/layout.tsx` | Root layout with sidebar + page transition |
| `app/error.tsx` | Error boundary UI |
| `app/api/chat/route.ts` | Streaming Claude chat endpoint; injects transits/projects/decisions |
| `app/api/transits/route.ts` | REST endpoint for raw transit data |

## Database tables (astro.db)

- **projects** — id, name, intention, domain, house, state, value_model, created_at
- **decisions** — id, description, direction (stretch|default), context, house, date
- **messages** — id, role (user|assistant), content, created_at

## Caching pattern

Functions using the `'use cache'` directive (in `lib/now-data.ts`) must have all cache-key parameters explicitly referenced. The parameters `key` and `bucket12h` are suppressed with `void key; void bucket12h;` — this is intentional.

Cache profiles are defined in `next.config.ts`:
- `transits`: 4h revalidate
- `interpretations`: 12h revalidate

## Dynamic rendering

Pages that read from SQLite or the ephemeris must call `await connection()` inside an async component wrapped in `<Suspense>`. This prevents static prerendering. Do NOT use `export const dynamic = 'force-dynamic'` — it conflicts with `cacheComponents: true`.

## Natal chart (Caroline)

- Sun Sagittarius 27° · H8
- Moon Gemini 1° · H1
- Rising Taurus
- Venus Scorpio 15° · H7
- Jupiter Virgo · H6
- Saturn Aquarius · H10
- North Node Capricorn · H9
- South Node Cancer · H3
- MC conjunct Neptune

## Environment

Requires `ANTHROPIC_API_KEY` in `.env.local`. Without it, all Claude features degrade gracefully (empty strings returned).

## Running locally

```bash
cd astro
npm install
npm run dev
```
