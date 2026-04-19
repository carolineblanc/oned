import { cacheLife } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { NATAL_POSITIONS, type TransitAspect, type PlanetPosition } from './ephemeris';

// ─── System prompts ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a precise, evocative astrology guide writing for someone with Sun in Sagittarius (8th house), Moon in Gemini (1st house), Taurus rising — a creative strategist, writer, and connector in a Personal Year 5 of movement and expansion. You speak in clear, grounded, specific language. You avoid spiritual clichés and generic advice. Each interpretation is 2–3 sentences that name the energy available and what it concretely calls for: an action, an awareness, a decision posture.`;

const WHATS_ACTIVE_SYSTEM = `You are a precise astrology guide writing for Caroline: Sun Sagittarius 8th (identity through transformation and shared stakes — acts best when co-invested), Moon Gemini 1st (mind is identity, fast lateral thinking), Taurus rising (grounded presence), North Node Capricorn 9th (here to build intellectual frameworks and claim authority, not just accumulate knowledge), Venus/Pluto Scorpio 7th (depth in partnership is the asset, not the obstacle), Saturn Aquarius 10th (unconventional career structure), Jupiter natal Virgo 6th (grows through elegant systems but over-builds). Personal Year 5 — expansion through movement. Active projects: Allora (luxury goods sourcing, House 8), OOC (arts entrepreneurship platform, Houses 7–8), collector education content (House 9). Write 2–3 sentences. Be grounded and specific. Name the energy available and its concrete implication for her actual work or growth edge. Reference specific projects or patterns where genuinely relevant. No spiritual clichés. No generic advice.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function buildWhatsActiveContext(
  aspect: TransitAspect,
  planet: PlanetPosition,
  moonPhase: string,
): string {
  const dir        = aspect.applying ? 'applying — building toward exact' : 'separating — releasing';
  const natalHouse = NATAL_POSITIONS[aspect.natalPlanet].house;
  const orbRounded = Math.round(aspect.orb * 2) / 2;
  return (
    `Transit: ${planet.name} at ${planet.degreeInSign}° ${planet.sign}` +
    `${planet.retrograde ? ' (Rx)' : ''} ` +
    `${aspect.aspect} natal ${aspect.natalPlanet} in House ${natalHouse}. ` +
    `${orbRounded}° orb, ${dir}. ${aspect.exactness}% exact. ` +
    `Moon phase: ${moonPhase}. ` +
    `What does this mean for her work and growth edge right now?`
  );
}

// ─── Existing helper ──────────────────────────────────────────────────────────

export function buildTransitContext(
  aspect: TransitAspect,
  planet: PlanetPosition,
  moonPhase: string,
): string {
  const dir = aspect.applying ? 'applying (building)' : 'separating (releasing)';
  const natalHouse = NATAL_POSITIONS[aspect.natalPlanet].house;
  // Round orb to nearest 0.5° so small orbital drift doesn't bust the cache key
  const orbRounded = Math.round(aspect.orb * 2) / 2;
  return (
    `${planet.name} at ${planet.degreeInSign}° ${planet.sign} forms a ${aspect.aspect} ` +
    `to natal ${aspect.natalPlanet} in the ${natalHouse}th house. ` +
    `${orbRounded}° orb, ${dir}. Moon phase: ${moonPhase}. ` +
    `What energy is available and what does it call for?`
  );
}

// ─── What's Active: richer cached interpretation ──────────────────────────────

export async function getWhatsActiveInterpretation(
  key: string,
  bucket12h: string,
  context: string,
): Promise<string> {
  'use cache';
  cacheLife({ stale: 60, revalidate: 12 * 3600, expire: 12 * 3600 });

  void key;
  void bucket12h;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return '';

  try {
    const client   = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 250,
      system:     WHATS_ACTIVE_SYSTEM,
      messages:   [{ role: 'user', content: context }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text.trim() : '';
  } catch {
    return '';
  }
}

// ─── Cached house transit one-liner ──────────────────────────────────────────

export async function getHouseTransitLine(
  planetKey: string,
  houseN: number,
  bucket12h: string,
  context: string,
): Promise<string> {
  'use cache';
  cacheLife({ stale: 60, revalidate: 12 * 3600, expire: 12 * 3600 });

  void planetKey;
  void houseN;
  void bucket12h;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return '';

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 60,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: context }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text.trim() : '';
  } catch {
    return '';
  }
}

// ─── Cached interpretation ────────────────────────────────────────────────────
//
// Arguments are the cache key: `key` (planet-aspect-planet slug) + `bucket12h`
// (changes every 12 h) + `context` (rounded context string). This ensures the
// same aspect pair in the same half-day always returns the cached text.

export async function getInterpretation(
  key: string,
  bucket12h: string,
  context: string,
): Promise<string> {
  'use cache';
  cacheLife({ stale: 60, revalidate: 12 * 3600, expire: 12 * 3600 });

  // Suppress unused-variable warnings — these exist purely as cache-key params.
  void key;
  void bucket12h;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return '';

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 180,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: context }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text.trim() : '';
  } catch {
    return '';
  }
}
