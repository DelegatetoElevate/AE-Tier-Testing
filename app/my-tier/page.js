import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Shell from '@/components/Shell';

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return (
    <Shell profile={profile}>
      <div className="page-head"><div><h1>My Tier</h1><p>Coming in the next build. The foundation is live first so we can confirm it works end to end.</p></div></div>
      <div className="card"><div className="empty-state"><strong>Not built yet</strong>This screen is part of the next step.</div></div>
    </Shell>
  );
}
