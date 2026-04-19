import { calcTransits, type TransitsResult } from '@/lib/ephemeris';
import { NextRequest } from 'next/server';

// ─── In-memory cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  data: TransitsResult;
  expiresAt: number;
}

// Two separate cache buckets: full result + moon-only
const cache = new Map<string, CacheEntry>();

const TTL_STANDARD = 4 * 60 * 60 * 1000; // 4 hours
const TTL_MOON     = 2 * 60 * 60 * 1000; // 2 hours

function cacheKey(date: Date): string {
  // Round to nearest 30-minute slot for Moon cache granularity
  const slot = Math.floor(date.getTime() / (30 * 60 * 1000));
  return `transits:${slot}`;
}

function moonCacheKey(date: Date): string {
  const slot = Math.floor(date.getTime() / (30 * 60 * 1000));
  return `moon:${slot}`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(date.getTime())) {
      return Response.json({ error: 'Invalid date parameter' }, { status: 400 });
    }

    const now = Date.now();

    // Check full-result cache first
    const key = cacheKey(date);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return Response.json({ ...cached.data, cached: true });
    }

    // Compute fresh result
    const result = calcTransits(date);

    // Cache the full result (expires in 4h)
    cache.set(key, { data: result, expiresAt: now + TTL_STANDARD });

    // Also cache moon data separately with 2h TTL (overwrite moon fields in a parallel entry)
    const moonKey = moonCacheKey(date);
    cache.set(moonKey, {
      data: { ...result },
      expiresAt: now + TTL_MOON,
    });

    // Prune stale entries to avoid unbounded growth
    if (cache.size > 200) {
      for (const [k, v] of cache.entries()) {
        if (v.expiresAt <= now) cache.delete(k);
      }
    }

    return Response.json({ ...result, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/transits]', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
