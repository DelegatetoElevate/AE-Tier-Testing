// ═══════════════════════════════════════════════════════════════
// AE Tier Testing — scoring engine
// Ported VERBATIM from the working prototype so the math is identical.
// Do not "improve" the numbers here — these standards are locked.
// ═══════════════════════════════════════════════════════════════

export const TIERS = [
  { n: 1, name: 'Rookie',    band: 'White'  },
  { n: 2, name: 'Contender', band: 'Yellow' },
  { n: 3, name: 'Pro',       band: 'Red'    },
  { n: 4, name: 'MVP',       band: 'Black'  },
];
export const TIER0 = 'Recruit';

// The two standard sheets. Kept here as the source of truth for the UI;
// the same values are seeded in the `movements` table for server-side use.
export const STD = {
  womens: {
    label: "Women's",
    qualify: 5, // 5 of 7
    movements: [
      { id: 'leg_press',     name: 'Leg Press',       type: 'bwLift',  reps: 10, mult: [1.5, 2.0, 2.5, 3.0] },
      { id: 'deadlift',      name: 'Deadlift',        type: 'bwLift',  reps: 10, mult: [0.75, 1.0, 1.25, 1.5] },
      { id: 'push_up',       name: 'Push Up',         type: 'pushup',  toes: [5, 10, 15, 20], knees: [12, 15, 20, 25] },
      { id: 'inverted_row',  name: 'Inverted Row',    type: 'loadRow', reps: 8,  add: [0, 10, 15, 20] },
      { id: 'lat_pull_down', name: 'Lat Pull Down',   type: 'bwLift',  reps: 10, mult: [0.6, 0.8, 1.0, 1.25] },
      { id: 'plank',         name: 'Plank Challenge', type: 'plank',   hold: 60, add: [0, 10, 20, 30] },
      { id: 'crazy8',        name: 'Crazy 8 HIIT',    type: 'forTime', sec: [300, 240, 180, 150] },
    ],
  },
  mens: {
    label: "Men's",
    qualify: 6, // 6 of 8
    movements: [
      { id: 'leg_press',     name: 'Leg Press',       type: 'bwLift',  reps: 10, mult: [1.5, 2.0, 2.5, 3.0] },
      { id: 'deadlift',      name: 'Deadlift',        type: 'bwLift',  reps: 10, mult: [0.75, 1.0, 1.25, 1.5] },
      { id: 'push_up',       name: 'Push Up',         type: 'pushup',  toes: [5, 10, 15, 20], knees: [12, 15, 20, 25] },
      { id: 'bench_press',   name: 'Bench Press',     type: 'bwLift',  reps: 10, mult: [0.6, 0.8, 1.0, 1.25], MISSING: true },
      { id: 'inverted_row',  name: 'Inverted Row',    type: 'loadRow', reps: 8,  add: [0, 10, 15, 20] },
      { id: 'lat_pull_down', name: 'Lat Pull Down',   type: 'bwLift',  reps: 10, mult: [0.6, 0.8, 1.0, 1.25] },
      { id: 'plank',         name: 'Plank Challenge', type: 'plank',   hold: 90, add: [0, 10, 20, 30] },
      { id: 'crazy8',        name: 'Crazy 8 HIIT',    type: 'forTime', sec: [240, 180, 150, 120] },
    ],
  },
};

export const QUARTERS = ['2025-Q3', '2025-Q4', '2026-Q1', '2026-Q2', '2026-Q3'];
export const OPEN_Q = '2026-Q3';

export const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
export const qLabel = (q) => 'Q' + q.slice(-1) + " '" + q.slice(2, 4);
export const tierName = (t) => (t === 0 ? 'Level 0' : TIERS[t - 1].name);

// Level a typed qualifying weight earns for a weighted lift.
export function levelFromWeight(m, w, bw) {
  if (!w || !bw || !m.mult) return 0;
  const ratio = w / bw;
  let lvl = 0;
  for (let i = 0; i < 4; i++) if (ratio >= m.mult[i]) lvl = i + 1;
  return lvl;
}

// Level for one movement given the athlete's entry + bodyweight.
// Returns { lvl, next }. Verbatim rules from the prototype.
export function levelOf(m, e, bw) {
  if (!e || m.MISSING) return { lvl: 0, next: null };
  const hit = (i) => {
    switch (m.type) {
      case 'bwLift': {
        if (e.qualWeight != null && e.qualWeight !== '')
          return levelFromWeight(m, e.qualWeight, bw) >= i + 1;
        return (e.level || 0) >= i + 1;
      }
      case 'pushup': {
        const bands = e.variant === 'knees' ? m.knees : m.toes;
        return (e.reps || 0) >= bands[i];
      }
      case 'loadRow':
        return (e.reps || 0) >= m.reps && (e.added || 0) >= m.add[i];
      case 'plank':
        return (e.seconds || 0) >= m.hold && (e.added || 0) >= m.add[i];
      case 'forTime':
        return (e.seconds || 0) > 0 && e.seconds <= m.sec[i];
      default:
        return false;
    }
  };
  let lvl = 0;
  for (let i = 0; i < 4; i++) if (hit(i)) lvl = i + 1;
  const next = lvl < 4 ? need(m, lvl, bw, e) : null;
  return { lvl, next };
}

// What it would take to reach the next level up on a movement.
export function need(m, lvl, bw, e) {
  const i = lvl;
  switch (m.type) {
    case 'bwLift':
      if (!m.mult) return 'Standard not set';
      return `${Math.round(m.mult[i] * bw)} lb × ${m.reps} (${m.mult[i]}× BW)`;
    case 'pushup': {
      const bands = e?.variant === 'knees' ? m.knees : m.toes;
      return `${bands[i]} reps ${e?.variant === 'knees' ? 'on knees' : 'on toes'}`;
    }
    case 'loadRow':
      return m.add[i] ? `${m.reps} reps with +${m.add[i]} lb` : `${m.reps} reps at 30–45°`;
    case 'plank':
      return m.add[i] ? `${m.hold}s hold with +${m.add[i]} lb` : `${m.hold}s bodyweight hold`;
    case 'forTime':
      return `Under ${mmss(m.sec[i])}`;
    default:
      return '';
  }
}

// The tier: highest level cleared on enough movements.
// `test` = { entries: {movementId: entry}, bodyweight }, `standardId` = 'mens'|'womens'
export function tierOf(test, standardId) {
  const std = STD[standardId];
  const per = {};
  std.movements.forEach((m) => (per[m.id] = levelOf(m, test.entries[m.id], test.bodyweight)));
  const counts = [1, 2, 3, 4].map((L) => std.movements.filter((m) => per[m.id].lvl >= L).length);
  let tier = 0;
  counts.forEach((c, i) => {
    if (c >= std.qualify) tier = i + 1;
  });
  return {
    per,
    counts,
    tier,
    movements: std.movements,
    qualify: std.qualify,
    total: std.movements.length,
    scorable: std.movements.filter((m) => !m.MISSING).length,
  };
}

// Has the athlete logged anything for this movement yet?
export function hasEntry(m, e) {
  if (!e) return false;
  if (m.type === 'bwLift') return !!e.level;
  if (m.type === 'pushup') return !!e.reps;
  if (m.type === 'loadRow') return !!e.reps || !!e.added;
  if (m.type === 'plank') return !!e.seconds || !!e.added;
  if (m.type === 'forTime') return !!e.seconds;
  return false;
}

// Is this movement COMPLETE (drives the checkmark)? For a lift, a level
// isn't enough — the qualifying weight must be entered.
export function isComplete(m, e) {
  if (!e) return false;
  if (m.type === 'bwLift') {
    return !!e.level && e.qualWeight != null && e.qualWeight !== '' && Number(e.qualWeight) > 0;
  }
  return hasEntry(m, e);
}

// Human-readable standard line for a movement at a given bodyweight.
export function standardLine(m, bw) {
  if (m.MISSING) return 'Standards missing from the rubric';
  switch (m.type) {
    case 'bwLift':
      return bw
        ? `${m.reps} reps · L1–L4: ${m.mult.map((x) => Math.round(x * bw * 10) / 10).join(' / ')} lb`
        : `${m.reps} reps · ${m.mult.join('× / ')}× bodyweight`;
    case 'pushup':
      return `Toes: ${m.toes.join(' / ')} · Knees: ${m.knees.join(' / ')}`;
    case 'loadRow':
      return `${m.reps} reps at 30–45° · added ${m.add.join(' / ')} lb`;
    case 'plank':
      return `${m.hold}s hold · added ${m.add.join(' / ')} lb`;
    case 'forTime':
      return `Under ${m.sec.map(mmss).join(' / ')}`;
    default:
      return '';
  }
}
