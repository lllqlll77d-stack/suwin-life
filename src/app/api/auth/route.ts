// ============================================================
// POST /api/auth — Verify site access password
// ============================================================

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function getSitePassword(): string | null {
  const pw = process.env.SITE_PASSWORD;
  if (!pw || pw === '') return null;
  return pw;
}

function hashPassword(password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(`site-auth:${password}`);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]!;
    hash = ((hash << 5) - hash) + byte;
    hash |= 0;
  }
  const salt = 'suwin-site-gate';
  const combined = salt + password;
  let hash2 = 0;
  for (let i = 0; i < combined.length; i++) {
    hash2 = ((hash2 << 5) - hash2) + combined.charCodeAt(i);
    hash2 |= 0;
  }
  return Math.abs(hash).toString(36) + '.' + Math.abs(hash2).toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const sitePassword = getSitePassword();

    if (!sitePassword) {
      return Response.json(
        { success: false, error: 'Password protection is not configured' },
        { status: 500 }
      );
    }

    if (!password || typeof password !== 'string') {
      return Response.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password !== sitePassword) {
      return Response.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    const token = hashPassword(password);
    return Response.json({ success: true, token });
  } catch {
    return Response.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
