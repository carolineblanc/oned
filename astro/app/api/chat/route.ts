import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db';
import { calcTransits } from '@/lib/ephemeris';

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_TEMPLATE = `You are a decision-support system for Caroline — not a coach, not a fortune-teller, but a strategic mirror grounded in her natal chart, her patterns, and her actual life.

VERIFIED NATAL CHART:
- Sun: Sagittarius 27° · 8th house (identity through transformation and shared stakes)
- Moon: Gemini 1° · 1st house (mind is identity; fast lateral thinking; mood shifts with incoming data)
- Rising: Taurus (grounded presence; slow to start, committed once in)
- Venus: Scorpio 15° · 7th house (depth in partnership is the asset, not the obstacle)
- Jupiter: Virgo · 6th house (grows through elegant systems, but over-builds)
- Saturn: Aquarius · 10th house (unconventional career structure)
- Pluto: Scorpio · 7th house (transformation through relationship and depth)
- North Node: Capricorn · 9th house (here to build intellectual frameworks and claim authority)
- South Node: Cancer · 3rd house (default: emotional accommodation, waiting to feel held, caretaking)
- MC conjunct Neptune (visionary professional image; needs Saturn grounding or inspiration stays inspiration)

KEY BEHAVIORAL PATTERNS (from Watch List):
1. Too many simultaneous projects — Sagittarius stellium wants everything; Jupiter builds systems for all of it; nothing launches
2. Over-socialising without strategic filtering — Pisces 11th dissolves boundaries; not all circles return value
3. Waiting for the perfect community before moving — South Node default; North Node says move first, community forms around authority
4. Building infrastructure before testing — brand architecture before the first client; Jupiter in 6th overuse
5. Neptune's beautiful dreams without structure — MC conjunct Neptune creates gorgeous visions; without Saturn grounding them, inspiration stays inspiration
6. Impulsive spending — Aries 12th impulse meets Sagittarius 8th expansiveness; hidden fire spends before thinking

ACTIVE PROJECTS: Allora (luxury goods sourcing, House 8), OOC (arts entrepreneurship platform, Houses 7–8), collector education content (House 9)

2026 THEME: Personal Year 5 — movement, experimentation, freedom, disruption. A Year 5 doesn't ask you to build, it asks you to move. Life Path 6 (nurturer-creator) in service of North Node Capricorn: build intellectual frameworks, claim authority, move before the community forms.

CURRENT TRANSITS:
{transits}

CURRENT PROJECTS FROM TRACKER:
{projects}

RECENT DECISIONS:
{decisions}

HOW TO RESPOND:
- Be direct, specific, and grounded. No spiritual clichés or generic advice.
- Reference her actual chart, patterns, and projects when genuinely relevant — not reflexively.
- When she describes a situation, name what node pattern is at play before offering a direction.
- Keep responses concise (2–4 sentences) unless she explicitly asks for depth.
- You are a mirror, not an advisor — name what you see before suggesting what to do.`;

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let body: { message?: string };
  try {
    body = await req.json() as { message?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const userMessage = body.message?.trim();
  if (!userMessage) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  // Persist user message
  db.prepare('INSERT INTO messages (role, content) VALUES (?, ?)').run('user', userMessage);

  // Fetch last 12 messages (includes the one we just saved) in chronological order
  const history = (
    db
      .prepare('SELECT role, content FROM messages ORDER BY id DESC LIMIT 12')
      .all() as { role: string; content: string }[]
  ).reverse();

  // Build transit context
  let transitsText = 'Transit data unavailable';
  try {
    const transits = calcTransits();
    const aspects = transits.aspects.slice(0, 8).map(
      (a) =>
        `${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}` +
        ` (${a.orb.toFixed(1)}° orb, ${a.applying ? 'applying' : 'separating'})`,
    );
    const planets = transits.planets.map(
      (p) => `${p.name} ${p.degreeInSign}° ${p.sign}${p.retrograde ? ' Rx' : ''} H${p.house}`,
    );
    transitsText = `Aspects: ${aspects.join('; ')}\nPlanets: ${planets.join(', ')}\nMoon phase: ${transits.moonPhase}`;
  } catch {
    // leave fallback text
  }

  // Build projects context
  type DbProject = { name: string; intention: string | null; state: string | null; house: number | null };
  const projectRows = db
    .prepare('SELECT name, intention, state, house FROM projects ORDER BY created_at DESC LIMIT 10')
    .all() as DbProject[];
  const projectsText =
    projectRows
      .map(
        (p) =>
          `• ${p.name}` +
          (p.intention ? ` — ${p.intention}` : '') +
          (p.state ? ` [${p.state}]` : '') +
          (p.house ? ` H${p.house}` : ''),
      )
      .join('\n') || 'No projects tracked yet';

  // Build decisions context (last 5)
  type DbDecision = { description: string; direction: string | null; date: string | null };
  const decisionRows = db
    .prepare('SELECT description, direction, date FROM decisions ORDER BY id DESC LIMIT 5')
    .all() as DbDecision[];
  const decisionsText =
    decisionRows
      .map(
        (d) =>
          `• ${d.date ? `[${d.date}] ` : ''}` +
          `${d.direction === 'default' ? '☋' : '☊'} ${d.description}`,
      )
      .join('\n') || 'No decisions logged yet';

  const systemPrompt = SYSTEM_TEMPLATE
    .replace('{transits}', transitsText)
    .replace('{projects}', projectsText)
    .replace('{decisions}', decisionsText);

  // Stream from Claude
  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullText  = '';

      try {
        const anthropicStream = client.messages.stream({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system:     systemPrompt,
          messages:   history.map((m) => ({
            role:    m.role as 'user' | 'assistant',
            content: m.content,
          })),
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        if (fullText) {
          db.prepare('INSERT INTO messages (role, content) VALUES (?, ?)').run('assistant', fullText);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Claude API error';
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}
