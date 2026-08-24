import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

// Returns the signed-in user's auth record + a ready Supabase client.
// If nobody is signed in, redirects to /login.
// If the user hasn't set their name yet, redirects to /onboarding
// (unless skipNameCheck is passed, used by the onboarding page itself).
export async function requireUser({ skipNameCheck = false } = {}) {
  const supabase = createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }
  if (!user) redirect('/login');

  if (!skipNameCheck) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('name_set')
      .eq('id', user.id)
      .single();
    if (prof && prof.name_set === false) redirect('/onboarding');
  }

  return { user, supabase };
}
