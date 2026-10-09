'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

const initials = (n) =>
  (n || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function Shell({ profile, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isCoach = profile?.role === 'coach';

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  // Slice 1 ships the Leaderboard live. Other tabs are placeholders for now.
  const tabs = [
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/my-tier', label: 'My Tier' },
    { href: '/history', label: 'History' },
    { href: '/standards', label: 'Standards' },
  ];
  if (isCoach) {
    tabs.push({ href: '/approvals', label: 'Approvals' });
    tabs.push({ href: '/members', label: 'Members' });
  }

  return (
    <>
      <div className="topbar">
        <div className="wordmark">
          <i>AE</i> Tier Testing <span>ALLEN ELLIOTT FITNESS</span>
        </div>
        <div className="spacer" />
        <a href="/onboarding" className={`me ${isCoach ? 'coach' : ''}`} style={{ textDecoration: 'none' }} title="Edit your name">
          <div className="av">{initials(profile?.name)}</div>
          <div>
            <span className="role">{isCoach ? 'Coach' : 'Athlete'}</span>
            {profile?.name}
          </div>
        </a>
        <button className="signout" onClick={signOut}>
          Sign out
        </button>
      </div>
      <nav>
        {tabs.map((t) => (
          <a key={t.href} href={t.href} aria-current={pathname === t.href ? 'page' : undefined}>
            {t.label}
          </a>
        ))}
      </nav>
      <main>{children}</main>
    </>
  );
}
