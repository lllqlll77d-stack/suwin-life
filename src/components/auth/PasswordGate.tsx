'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';

import AmbientVideo from '@/components/layout/AmbientVideo';
import SiteBrand from '@/components/layout/SiteBrand';

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
    try {
      if (localStorage.getItem(AUTH_STORAGE_KEY)) setAuthed(true);
    } catch { /* Password entry remains available when storage is restricted. */ }
    finally { setChecking(false); }
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

  if (!passwordConfigured) return <>{children}</>;
  if (checking) return <div className="loading-screen" role="status">ENTERING YOUR COSMOS…</div>;
  if (authed) return <>{children}</>;

  return (
    <div className="auth-page">
      <AmbientVideo />
      <header className="auth-header"><SiteBrand /><span className="eyebrow">[ PRIVATE SPACE ]</span></header>
      <main className="auth-main">
        <p className="eyebrow">A LITTLE UNIVERSE, JUST FOR YOU</p>
        <h1>welcome to<br />your cosmos</h1>
        <p className="auth-description">你的想法、记忆和日常，都在这里。<br />输入密码，回到自己的小宇宙。</p>
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
          <label htmlFor="site-password">访问密码</label>
          <div className="auth-input-row">
            <input id="site-password" type="password" autoComplete="current-password" value={password}
              onChange={(event) => { setPassword(event.target.value); setError(''); }}
              placeholder="请输入密码" disabled={loading} required autoFocus
              aria-invalid={Boolean(error)} aria-describedby={error ? 'auth-error' : undefined} />
            <button type="submit" className="outline-button" disabled={loading || !password.trim()}>{loading ? '验证中…' : 'ENTER ↗'}</button>
          </div>
          <div className="auth-status"><p id="auth-error" className="error-text" role="alert">{error}</p></div>
        </form>
      </main>
    </div>
  );
}
