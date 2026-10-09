import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Supabase redirects here after the user clicks the magic link. We exchange
// the code for a session (stored in cookies) and send them to the app.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — bounce back to login.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
