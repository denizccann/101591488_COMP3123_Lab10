// Demo JWT helpers. Client-side demo only, not real auth.
// A token is header.payload.signature, signed with HMAC-SHA256.
// The secret below is a hard-coded demo secret, visible in the browser.

const DEMO_SECRET = 'comp3123-lab10-demo-secret';

export function base64UrlEncode(input) {
  const base64 = btoa(unescape(encodeURIComponent(input)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

async function hmacSha256(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  );
  const bytes = new Uint8Array(signature);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createDemoToken(user, expiresInSeconds = 300) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(user.id),
    name: user.name,
    email: user.email,
    role: 'student',
    iat: now,
    exp: now + expiresInSeconds,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, DEMO_SECRET);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function decodeToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2],
      raw: { header: parts[0], payload: parts[1] },
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(payload) {
  if (!payload || typeof payload.exp !== 'number') return true;
  return Math.floor(Date.now() / 1000) >= payload.exp;
}

export function secondsUntilExpiry(payload) {
  if (!payload || typeof payload.exp !== 'number') return 0;
  return payload.exp - Math.floor(Date.now() / 1000);
}

export async function verifyDemoToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return { valid: false, reason: 'Malformed token (expected header.payload.signature).' };
  if (isTokenExpired(decoded.payload)) {
    return { valid: false, reason: 'Token has expired (exp claim is in the past).' };
  }
  const expected = await hmacSha256(
    `${decoded.raw.header}.${decoded.raw.payload}`,
    DEMO_SECRET,
  );
  if (expected !== decoded.signature) {
    return { valid: false, reason: 'Signature mismatch — the token was tampered with.' };
  }
  return { valid: true, reason: 'Signature valid and token not expired.' };
}
