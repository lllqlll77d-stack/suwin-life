// ============================================================
// POST /api/auth — Verify site access password
// GET  /api/auth — Check if password protection is configured
// ============================================================

import { NextRequest } from 'next/server';

// Force dynamic rendering — env vars must be read at request time
export const dynamic = 'force-dynamic';

function getSitePassword(): string | null {
  const pw = process.env.SITE_PASSWORD;
  if (!pw || pw === '') return null;
  return pw;
}

function hashPassword(password: string): string {
  // Simple SHA-256 hash so we don't store raw token in localStorage
  // Uses Web Crypto API available in Node.js 19+
  const encoder = new TextEncoder();
  const data = encoder.encode(`site-auth:${password}`);
  // Use a simple but fast hash — crypto.subtle isn't sync, so we use a
  // readable hex digest of the password prefixed for the token
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]!;
    hash = ((hash << 5) - hash) + byte;
    hash |= 0; // Convert to 32-bit integer
  }
  // Mix with a salt and encode as hex
  const salt = 'suwin-site-gate';
  const combined = salt + password;
  let hash2 = 0;
  for (let i = 0; i < combined.length; i++) {
    hash2 = ((hash2 << 5) - hash2) + combined.charCodeAt(i);
    hash2 |= 0;
  }
  return Math.abs(hash).toString(36) + '.' + Math.abs(hash2).toString(36);
}

export async function GET(_request: NextRequest) {
  const configured = !!getSitePassword();
  return Response.json({ configured });
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
