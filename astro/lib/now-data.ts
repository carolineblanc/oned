import { cacheLife } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { NATAL_POSITIONS, type TransitAspect, type PlanetPosition } from './ephemeris';

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a precise, evocative astrology guide writing for someone with Sun in Sagittarius (8th house), Moon in Gemini (1st house), Taurus rising — a creative strategist, writer, and connector in a Personal Year 5 of movement and expansion. You speak in clear, grounded, specific language. You avoid spiritual clichés and generic advice. Each interpretation is 2–3 sentences that name the energy available and what it concretely calls for: an action, an awareness, a decision posture.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
