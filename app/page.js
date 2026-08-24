import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export default async function Home() {
  // Temporary diagnostic: if env vars are missing/malformed, show it plainly
  // instead of a blank 500. Remove once login is confirmed working.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}>
        <h2>Config check</h2>
        <p>URL present: {url ? 'yes' : 'NO — missing'}</p>
        <p>Key present: {key ? 'yes' : 'NO — missing'}</p>
        <p>URL length: {url ? url.length : 0}</p>
        <p>Key length: {key ? key.length : 0}</p>
        <p>URL starts with https: {url ? String(url.startsWith('https://')) : 'n/a'}</p>
      </div>
    );
  }

  let redirectTo = '/login';
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}>
          <h2>Auth check failed</h2>
          <p>Message: {error.message}</p>
          <p>Status: {String(error.status)}</p>
          <p>URL length: {url.length} · Key length: {key.length}</p>
        </div>
      );
    }
    if (data?.user) redirectTo = '/leaderboard';
  } catch (e) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}>
        <h2>Client creation crashed</h2>
        <p>{String(e?.message || e)}</p>
        <p>URL length: {url.length} · Key length: {key.length}</p>
      </div>
    );
  }

  redirect(redirectTo);
}
