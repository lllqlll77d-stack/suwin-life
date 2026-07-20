'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';

const AUTH_STORAGE_KEY = 'site_auth_token';

export default function PasswordGate({
  passwordConfigured,
  children,
}: {
  passwordConfigured: boolean;
  children: ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // On mount: check localStorage for existing auth token
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!password.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, data.token);
        setAuthed(true);
      } else {
        setError('密码不正确，再试一次吧~');
        setPassword('');
      }
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, [password, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit]
  );

  // While checking localStorage on first mount, show nothing
  if (checking) return null;

  // If password protection is not configured, skip the gate entirely
  if (!passwordConfigured) return <>{children}</>;

  // Already authenticated — render the app
  if (authed) return <>{children}</>;

  // Password gate page
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, var(--pink-lotus) 0%, var(--purple-lavender) 50%, var(--pink-blush) 100%)',
      }}
    >
      {/* Floating decorations */}
      <div
        className="absolute animate-float"
        style={{ top: '10%', left: '15%', fontSize: '40px', opacity: 0.6 }}
      >
        ✨
      </div>
      <div
        className="absolute animate-float-slow"
        style={{ top: '20%', right: '12%', fontSize: '32px', opacity: 0.5 }}
      >
        🌸
      </div>
      <div
        className="absolute animate-float-fast"
        style={{ bottom: '15%', left: '20%', fontSize: '36px', opacity: 0.5 }}
      >
        💫
      </div>
      <div
        className="absolute animate-float"
        style={{ bottom: '25%', right: '18%', fontSize: '28px', opacity: 0.4 }}
      >
        🦋
      </div>

      {/* Glass card */}
      <div
        className="glass-card px-8 py-10 max-w-sm w-full mx-4 text-center animate-fade-in"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Lock icon */}
        <div className="text-5xl mb-4">🔐</div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{
            fontFamily: 'var(--font-pixel)',
            color: 'var(--text-primary)',
          }}
        >
          Suwin&apos;s Life
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          输入密码以继续访问
        </p>

        {/* Password input + Enter button on same row */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="请输入密码"
            disabled={loading}
            autoFocus
            className="flex-1 text-center py-3 px-4 rounded-full text-base outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.4)',
              border: error
                ? '1.5px solid #FF1493'
                : '1.5px solid rgba(255,255,255,0.5)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !password.trim()}
            className="shrink-0 px-6 py-3 rounded-full text-white font-medium text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
              boxShadow: '0 4px 16px rgba(255,20,147,0.3)',
            }}
          >
            {loading ? '...' : 'Enter'}
          </button>
        </div>
      </div>
    </div>
  );
}
