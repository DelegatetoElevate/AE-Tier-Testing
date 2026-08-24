import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

// Returns the signed-in user's auth record + a ready Supabase client.
// If nobody is signed in (including the "Auth session missing" case),
// redirects to /login instead of throwing.
export async function requireUser() {
  const supabase = createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }
  if (!user) redirect('/login');
  return { user, supabase };
}
