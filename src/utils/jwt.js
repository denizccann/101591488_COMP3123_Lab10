/**
 * jwt.js — Demo JWT helpers (client-side DEMO only, NOT production auth)
 *
 * A JSON Web Token has three Base64URL-encoded parts joined by dots:
 *   header.payload.signature
 *
 * - header:    {"alg":"HS256","typ":"JWT"}        (algorithm + token type)
 * - payload:   {"sub","name","iat","exp", ...}    (the "claims")
 * - signature: HMAC-SHA256( base64url(header) + "." + base64url(payload),
 *                            DEMO_SECRET )
 *
 * The signature is what makes a JWT tamper-evident: if anyone edits the
 * payload, the recomputed signature no longer matches. In a real system
 * the secret lives ONLY on the server; here it is a hard-coded demo secret
 * in the browser on purpose, so the token can be created and verified
 * entirely on the client. That is exactly why this is a demo and must
 * never be used for real authentication.
 */

// Demo secret — visible in the browser by design. NOT a real secret.
const DEMO_SECRET = 'comp3123-lab10-demo-secret';

// ---------------------------------------------------------------------------
// Base64URL helpers
// ---------------------------------------------------------------------------
export function base64UrlEncode(input) {
  // input: string (UTF-8) -> base64url string (no padding, URL-safe chars)
  const base64 = btoa(unescape(encodeURIComponent(input)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

// ---------------------------------------------------------------------------
// Signing / verifying (Web Crypto API, HMAC-SHA256)
// ---------------------------------------------------------------------------
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
  // ArrayBuffer -> base64url
  const bytes = new Uint8Array(signature);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Create a demo JWT for `user`. `expiresInSeconds` defaults to 300 (5 min). */
export async function createDemoToken(user, expiresInSeconds = 300) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(user.id),
    name: user.name,
    email: user.email,
    role: 'student',
    iat: now, // issued at (seconds since epoch)
    exp: now + expiresInSeconds, // expires at
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, DEMO_SECRET);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/** Split a token and decode header + payload. Returns null on bad format. */
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

/** True when the payload's `exp` claim is in the past. */
export function isTokenExpired(payload) {
  if (!payload || typeof payload.exp !== 'number') return true;
  return Math.floor(Date.now() / 1000) >= payload.exp;
}

/** Seconds left until the token expires (0 or negative when expired). */
export function secondsUntilExpiry(payload) {
  if (!payload || typeof payload.exp !== 'number') return 0;
  return payload.exp - Math.floor(Date.now() / 1000);
}

/**
 * Verify a token: correct 3-part shape, decodable payload, valid
 * signature, and not expired. Returns { valid, reason }.
 */
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
