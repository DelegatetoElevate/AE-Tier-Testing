'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendLink(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="auth-wrap">
      <div className="auth">
        <div className="mark">
          <i>AE</i> Tier Testing
          <span>ALLEN ELLIOTT FITNESS · QUARTERLY BENCHMARK</span>
        </div>

        <div className="auth-card">
          {sent ? (
            <>
              <h2>Check your email</h2>
              <p>
                We sent a sign-in link to <b>{email}</b>. Open it on this device to continue. The
                link works once and expires after a while.
              </p>
              <div className="inbox">
                <div className="eyebrow">Link sent</div>
                <p>No email after a minute? Check spam, or try again.</p>
              </div>
              <button
                className="btn ghost wide"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
              >
                Use a different email
              </button>
            </>
          ) : (
            <>
              <h2>Sign in</h2>
              <p>Enter your email and we'll send you a sign-in link. No password needed.</p>
              <form onSubmit={sendLink}>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="inp"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="banner warn" style={{ marginTop: 14, marginBottom: 0 }}>
                    <span>{error}</span>
                  </div>
                )}
                <button
                  className="btn primary wide"
                  type="submit"
                  disabled={loading}
                  style={{ marginTop: 16 }}
                >
                  {loading ? 'Sending…' : 'Send sign-in link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
