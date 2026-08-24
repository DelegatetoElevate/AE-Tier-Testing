'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function OnboardingForm({ userId, initialFirst = '', initialLast = '', isEdit = false }) {
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function save(e) {
    e.preventDefault();
    setError('');
    const f = first.trim();
    const l = last.trim();
    if (!f || !l) {
      setError('Please enter both your first and last name.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: f,
        last_name: l,
        name: `${f} ${l}`,
        name_set: true,
      })
      .eq('id', userId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/leaderboard');
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <div className="auth">
        <div className="mark">
          <i>AE</i> Tier Testing
          <span>ALLEN ELLIOTT FITNESS · QUARTERLY BENCHMARK</span>
        </div>
        <div className="auth-card">
          <h2>{isEdit ? 'Edit your name' : 'Welcome — what should we call you?'}</h2>
          <p>
            {isEdit
              ? 'Update how your name appears on the leaderboard and to your coach.'
              : 'This is how you\'ll appear on the leaderboard and to your coach.'}
          </p>
          <form onSubmit={save}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="first">First name</label>
              <input
                id="first"
                className="inp"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="last">Last name</label>
              <input
                id="last"
                className="inp"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
            {error && (
              <div className="banner warn" style={{ marginTop: 14, marginBottom: 0 }}>
                <span>{error}</span>
              </div>
            )}
            <button className="btn primary wide" type="submit" disabled={saving} style={{ marginTop: 18 }}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
