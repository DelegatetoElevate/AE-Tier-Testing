import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Shell from '@/components/Shell';
import { Band, Pips } from '@/components/Band';
import { STD, tierOf, tierName, OPEN_Q } from '@/lib/scoring';

// Rebuild the { entries, bodyweight } shape the scoring engine expects
// from the flat test_entries rows for one session.
function toTestShape(session, entryRows) {
  const entries = {};
  entryRows
    .filter((r) => r.test_session_id === session.id)
    .forEach((r) => {
      entries[r.movement_id] = {
        level: r.level ?? undefined,
        qualWeight: r.qual_weight ?? undefined,
        reps: r.reps ?? undefined,
        variant: r.variant ?? undefined,
        added: r.added ?? undefined,
        seconds: r.seconds ?? undefined,
      };
    });
  return { entries, bodyweight: Number(session.bodyweight) };
}

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // The signed-in person's profile (drives the shell + role).
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // All active athletes with an assigned standard.
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'member')
    .is('archived_at', null)
    .not('standard', 'is', null);

  // Their most recent approved test drives the current tier. Pull all
  // approved sessions + entries and reduce to latest-per-athlete here.
  const memberIds = (members ?? []).map((m) => m.id);
  let rows = [];

  if (memberIds.length) {
    const { data: sessions } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('status', 'approved')
      .in('profile_id', memberIds)
      .order('approved_at', { ascending: false });

    const sessionIds = (sessions ?? []).map((s) => s.id);
    const { data: entryRows } = sessionIds.length
      ? await supabase.from('test_entries').select('*').in('test_session_id', sessionIds)
      : { data: [] };

    // Latest approved session per athlete.
    const latest = {};
    (sessions ?? []).forEach((s) => {
      if (!latest[s.profile_id]) latest[s.profile_id] = s;
    });

    rows = (members ?? [])
      .map((m) => {
        const s = latest[m.id];
        if (!s) return null;
        const tr = tierOf(toTestShape(s, entryRows ?? []), m.standard);
        return { member: m, session: s, tr };
      })
      .filter(Boolean)
      // Rank by tier, then by movements cleared at that tier.
      .sort((a, b) => {
        if (b.tr.tier !== a.tr.tier) return b.tr.tier - a.tr.tier;
        const ac = a.tr.counts[Math.max(a.tr.tier - 1, 0)];
        const bc = b.tr.counts[Math.max(b.tr.tier - 1, 0)];
        return bc - ac;
      });
  }

  return (
    <Shell profile={profile}>
      <div className="page-head">
        <div>
          <h1>Leaderboard</h1>
          <p>
            Ranked by tier, then by how many movements you cleared. Only approved tests appear.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Standings</h2>
          <span className="eyebrow">{rows.length} ranked</span>
        </div>
        {rows.length === 0 ? (
          <div className="empty-state">
            <strong>No approved tests yet</strong>
            Once a coach approves the first test, athletes show up here.
          </div>
        ) : (
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Tier</th>
                  <th>Standard</th>
                  <th>BW</th>
                  <th>Cleared</th>
                  <th>Per movement</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ member, session, tr }, i) => {
                  const scorable = tr.movements.filter((m) => !m.MISSING);
                  const levels = scorable.map((m) => tr.per[m.id].lvl);
                  return (
                    <tr key={member.id}>
                      <td className="name">
                        <span className="num" style={{ color: 'var(--steel)', marginRight: 10 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {member.name}
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <Band tier={tr.tier} />
                      </td>
                      <td>{STD[member.standard].label}</td>
                      <td className="num">{Number(session.bodyweight)} lb</td>
                      <td className="num">
                        {tr.counts[Math.max(tr.tier - 1, 0)]} / {tr.scorable}
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <Pips levels={levels} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--steel)', marginTop: 12 }}>
        Each pip is one movement — shade shows the level reached.
      </p>
    </Shell>
  );
}
