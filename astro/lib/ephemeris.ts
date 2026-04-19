import swisseph from 'swisseph';

// ─── Constants ───────────────────────────────────────────────────────────────

const FLAGS = (swisseph.SEFLG_SPEED as number) | (swisseph.SEFLG_MOSEPH as number);

const PLANETS = [
  { name: 'Sun',        id: swisseph.SE_SUN as number },
  { name: 'Moon',       id: swisseph.SE_MOON as number },
  { name: 'Mercury',    id: swisseph.SE_MERCURY as number },
  { name: 'Venus',      id: swisseph.SE_VENUS as number },
  { name: 'Mars',       id: swisseph.SE_MARS as number },
  { name: 'Jupiter',    id: swisseph.SE_JUPITER as number },
  { name: 'Saturn',     id: swisseph.SE_SATURN as number },
  { name: 'Uranus',     id: swisseph.SE_URANUS as number },
  { name: 'Neptune',    id: swisseph.SE_NEPTUNE as number },
  { name: 'Pluto',      id: swisseph.SE_PLUTO as number },
  { name: 'North Node', id: swisseph.SE_MEAN_NODE as number },
] as const;

export type PlanetName = typeof PLANETS[number]['name'];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// ─── Natal chart (single source of truth) ────────────────────────────────────

export const NATAL_BIRTH = {
  year: 1991, month: 12, day: 19,
  hour: 14, minute: 2, second: 0,
  lat: 48.8566, lon: 2.3522,
};

// Natal planet longitudes — swisseph-calculated from birth data (Dec 19 1991 14:02 Paris)
// Text descriptions from birth chart are the SINGLE SOURCE OF TRUTH for house assignments.
export const NATAL_POSITIONS: Record<PlanetName, { longitude: number; house: number }> = {
  'Sun':        { longitude: 267.122, house: 8  }, // Sag 27°
  'Moon':       { longitude:  61.015, house: 1  }, // Gem 1°
  'Mercury':    { longitude: 248.002, house: 8  }, // Sag 8°
  'Venus':      { longitude: 225.529, house: 7  }, // Sco 15°
  'Mars':       { longitude: 254.686, house: 8  }, // Sag 14°
  'Jupiter':    { longitude: 164.422, house: 6  }, // Vir 14°
  'Saturn':     { longitude: 304.516, house: 10 }, // Aqu 4°
  'Uranus':     { longitude: 282.946, house: 9  }, // Cap 12°
  'Neptune':    { longitude: 285.754, house: 10 }, // Cap 15°
  'Pluto':      { longitude: 231.689, house: 7  }, // Sco 21°
  'North Node': { longitude: 280.466, house: 9  }, // Cap 10°
};

// Natal house cusps (Placidus), swisseph-calculated: AC Taurus 1°46′, MC Cap 14°11′
export const NATAL_HOUSE_CUSPS: number[] = [
   31.902,  // House 1  — Taurus 1°
   64.921,  // House 2  — Gemini 4°
   85.747,  // House 3  — Gemini 25°
  104.260,  // House 4  — Cancer 14° (IC)
  125.425,  // House 5  — Leo 5°
  156.761,  // House 6  — Virgo 6°
  211.902,  // House 7  — Scorpio 1°
  244.921,  // House 8  — Sagittarius 4°
  265.747,  // House 9  — Sagittarius 25°
  284.260,  // House 10 — Capricorn 14° (MC)
  305.425,  // House 11 — Aquarius 5°
  336.761,  // House 12 — Pisces 6°
];

// ─── Aspect definitions ───────────────────────────────────────────────────────

interface AspectDef {
  name: string;
  angle: number;
  orb: number;
}

const ASPECTS: AspectDef[] = [
  { name: 'conjunction',  angle:   0, orb: 8 },
  { name: 'opposition',   angle: 180, orb: 8 },
  { name: 'square',       angle:  90, orb: 7 },
  { name: 'trine',        angle: 120, orb: 7 },
  { name: 'sextile',      angle:  60, orb: 5 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanetPosition {
  name: PlanetName;
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  minuteInSign: number;
  house: number;
  speed: number;        // degrees/day; negative = retrograde
  retrograde: boolean;
}

export interface TransitAspect {
  transitPlanet: PlanetName;
  natalPlanet: PlanetName;
  aspect: string;
  orb: number;          // degrees from exact
  applying: boolean;    // true = getting closer to exact
  exactness: number;    // 0-100, 100 = exact
}

export interface MoonPhase {
  phase: string;        // e.g. "Waxing Gibbous"
  angle: number;        // Sun-Moon elongation 0-360
  illumination: number; // 0-100 %
  newMoon: { date: string; sign: ZodiacSign; house: number };
  fullMoon: { date: string; sign: ZodiacSign; house: number };
}

export interface TransitsResult {
  date: string;
  julianDay: number;
  planets: PlanetPosition[];
  aspects: TransitAspect[];
  activatedHouses: number[];
  moonPhase: MoonPhase;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function longitudeToSign(lon: number): { sign: ZodiacSign; degree: number; minute: number } {
  const normalized = ((lon % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degInSign = normalized - signIndex * 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.floor(degInSign),
    minute: Math.floor((degInSign % 1) * 60),
  };
}

function getHouseForLongitude(lon: number, cusps: number[]): number {
  const norm = ((lon % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const cusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];
    if (nextCusp > cusp) {
      if (norm >= cusp && norm < nextCusp) return i + 1;
    } else {
      // Wraps around 0°
      if (norm >= cusp || norm < nextCusp) return i + 1;
    }
  }
  return 1;
}

function angularDiff(a: number, b: number): number {
  let diff = Math.abs(((a - b + 540) % 360) - 180);
  return diff;
}

function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const result = swisseph.swe_utc_to_jd(y, m, d, h, 0, 0, 1) as {
    julianDayUT: number; julianDayET: number;
  };
  return result.julianDayUT;
}

function jdToDate(jd: number): Date {
  const r = swisseph.swe_revjul(jd, 1) as {
    year: number; month: number; day: number; hour: number;
  };
  const h = Math.floor(r.hour);
  const min = Math.round((r.hour - h) * 60);
  return new Date(Date.UTC(r.year, r.month - 1, r.day, h, min));
}

function calcLongitude(jd: number, bodyId: number): number {
  const result = swisseph.swe_calc_ut(jd, bodyId, FLAGS) as {
    longitude: number; longitudeSpeed: number; error?: string;
  };
  if (result.error) throw new Error(`swisseph error for body ${bodyId}: ${result.error}`);
  return result.longitude;
}

// ─── Moon phase helpers ───────────────────────────────────────────────────────

function phaseName(angle: number): string {
  if (angle < 22.5)  return 'New Moon';
  if (angle < 67.5)  return 'Waxing Crescent';
  if (angle < 112.5) return 'First Quarter';
  if (angle < 157.5) return 'Waxing Gibbous';
  if (angle < 202.5) return 'Full Moon';
  if (angle < 247.5) return 'Waning Gibbous';
  if (angle < 292.5) return 'Last Quarter';
  if (angle < 337.5) return 'Waning Crescent';
  return 'New Moon';
}

/**
 * Find JD when Sun-Moon elongation equals targetAngle (0=new moon, 180=full moon).
 * direction='prev' finds the most recent occurrence before nearJD,
 * direction='next' finds the next occurrence after nearJD.
 * Uses Newton's method after pre-positioning past the event.
 */
function findLunarEvent(nearJD: number, targetAngle: number, direction: 'prev' | 'next'): number {
  // Pre-position slightly past the event so Newton's method converges correctly
  const sLon0 = calcLongitude(nearJD, swisseph.SE_SUN as number);
  const mLon0 = calcLongitude(nearJD, swisseph.SE_MOON as number);
  const cur   = ((mLon0 - sLon0) + 360) % 360;

  let jd: number;
  if (direction === 'prev') {
    const back = ((cur - targetAngle) + 360) % 360;
    jd = nearJD - (back / 13) - 0.5; // overshoot slightly past the event backward
  } else {
    const fwd = ((targetAngle - cur) + 360) % 360;
    jd = nearJD + (fwd / 13) + 0.5; // overshoot slightly past the event forward
  }

  // Newton's method — Moon gains ~13°/day on Sun, converges in a few iterations
  for (let i = 0; i < 50; i++) {
    const sLon  = calcLongitude(jd, swisseph.SE_SUN as number);
    const mLon  = calcLongitude(jd, swisseph.SE_MOON as number);
    const angle = ((mLon - sLon) + 360) % 360;
    let diff    = angle - targetAngle;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) < 0.01) break;
    jd -= diff / 13;
  }
  return jd;
}

function calcMoonPhase(jd: number, houseCusps: number[]): MoonPhase {
  const sunLon  = calcLongitude(jd, swisseph.SE_SUN as number);
  const moonLon = calcLongitude(jd, swisseph.SE_MOON as number);
  const angle   = ((moonLon - sunLon) + 360) % 360;
  const illumination = Math.round((1 - Math.cos((angle * Math.PI) / 180)) / 2 * 100);

  const prevNewJD = findLunarEvent(jd, 0, 'prev');
  const nextFullJD = findLunarEvent(jd, 180, 'next');

  const newMoonLon  = calcLongitude(prevNewJD,  swisseph.SE_MOON as number);
  const fullMoonLon = calcLongitude(nextFullJD, swisseph.SE_MOON as number);

  const newMoonSign  = longitudeToSign(newMoonLon).sign;
  const fullMoonSign = longitudeToSign(fullMoonLon).sign;

  return {
    phase: phaseName(angle),
    angle: Math.round(angle * 100) / 100,
    illumination,
    newMoon: {
      date: jdToDate(prevNewJD).toISOString().split('T')[0],
      sign: newMoonSign,
      house: getHouseForLongitude(newMoonLon, houseCusps),
    },
    fullMoon: {
      date: jdToDate(nextFullJD).toISOString().split('T')[0],
      sign: fullMoonSign,
      house: getHouseForLongitude(fullMoonLon, houseCusps),
    },
  };
}

// ─── Main calculation ─────────────────────────────────────────────────────────

// ─── Upcoming lunations ───────────────────────────────────────────────────────

export interface UpcomingLunation {
  type: 'new' | 'full';
  date: string;
  sign: ZodiacSign;
  degree: number;
  house: number;
  longitude: number;
  nearNatal: Array<{ planet: PlanetName; orb: number }>;
}

export function getUpcomingLunations(date: Date = new Date()): UpcomingLunation[] {
  const jd       = dateToJD(date);
  const ORB      = 5;
  const results: UpcomingLunation[] = [];

  for (const [type, angle] of [['new', 0], ['full', 180]] as const) {
    const eventJD  = findLunarEvent(jd, angle, 'next');
    const lon      = calcLongitude(eventJD, swisseph.SE_MOON as number);
    const { sign, degree } = longitudeToSign(lon);

    // Check proximity to natal planets
    const nearNatal: Array<{ planet: PlanetName; orb: number }> = [];
    for (const [pName, natal] of Object.entries(NATAL_POSITIONS) as [PlanetName, { longitude: number }][]) {
      let diff = Math.abs(((lon - natal.longitude + 540) % 360) - 180);
      if (diff <= ORB) nearNatal.push({ planet: pName, orb: Math.round(diff * 100) / 100 });
    }
    nearNatal.sort((a, b) => a.orb - b.orb);

    results.push({
      type,
      date:      jdToDate(eventJD).toISOString().split('T')[0],
      sign,
      degree,
      house:     getHouseForLongitude(lon, NATAL_HOUSE_CUSPS),
      longitude: Math.round(lon * 100) / 100,
      nearNatal,
    });
  }

  return results;
}

export function calcTransits(date: Date = new Date()): TransitsResult {
  const jd = dateToJD(date);

  // 1. Transiting planet positions
  const planets: PlanetPosition[] = PLANETS.map(({ name, id }) => {
    const raw = swisseph.swe_calc_ut(jd, id, FLAGS) as {
      longitude: number; longitudeSpeed: number; error?: string;
    };
    if (raw.error) throw new Error(`swisseph(${name}): ${raw.error}`);

    const { sign, degree, minute } = longitudeToSign(raw.longitude);
    return {
      name,
      longitude: Math.round(raw.longitude * 1000) / 1000,
      sign,
      degreeInSign: degree,
      minuteInSign: minute,
      house: getHouseForLongitude(raw.longitude, NATAL_HOUSE_CUSPS),
      speed: Math.round(raw.longitudeSpeed * 10000) / 10000,
      retrograde: raw.longitudeSpeed < 0,
    };
  });

  // 2. Transiting aspects to natal planets
  const aspects: TransitAspect[] = [];
  for (const tp of planets) {
    for (const [natalName, natal] of Object.entries(NATAL_POSITIONS) as [PlanetName, { longitude: number }][]) {
      const diff = angularDiff(tp.longitude, natal.longitude);
      for (const { name: aspectName, angle, orb } of ASPECTS) {
        const deviation = Math.abs(diff - angle);
        if (deviation <= orb) {
          // Applying: transiting planet moving toward exact aspect
          // Compare current orb with orb one day ago
          const prevLon = ((tp.longitude - tp.speed) + 360) % 360;
          const prevDiff = angularDiff(prevLon, natal.longitude);
          const prevDeviation = Math.abs(prevDiff - angle);
          const applying = prevDeviation > deviation;

          aspects.push({
            transitPlanet: tp.name,
            natalPlanet: natalName,
            aspect: aspectName,
            orb: Math.round(deviation * 100) / 100,
            applying,
            exactness: Math.round((1 - deviation / orb) * 100),
          });
        }
      }
    }
  }

  // Sort aspects by exactness descending
  aspects.sort((a, b) => b.exactness - a.exactness);

  // 3. Activated natal houses
  const houseSet = new Set<number>();
  // Houses occupied by transiting planets
  for (const p of planets) houseSet.add(p.house);
  // Houses of aspected natal planets
  for (const asp of aspects) {
    houseSet.add(NATAL_POSITIONS[asp.natalPlanet].house);
  }
  const activatedHouses = Array.from(houseSet).sort((a, b) => a - b);

  // 4. Moon phase
  const moonPhase = calcMoonPhase(jd, NATAL_HOUSE_CUSPS);

  return {
    date: date.toISOString(),
    julianDay: Math.round(jd * 10000) / 10000,
    planets,
    aspects,
    activatedHouses,
    moonPhase,
  };
}
