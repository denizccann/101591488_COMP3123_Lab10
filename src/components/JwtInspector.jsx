import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markExpired } from '../features/auth/authSlice';
import { decodeToken, isTokenExpired, secondsUntilExpiry, verifyDemoToken } from '../utils/jwt';

/**
 * JwtInspector — shows the live token and decodes it in front of the user.
 * - Raw token split into header . payload . signature (colour-coded).
 * - Decoded JSON for header and payload (the claims: sub, name, iat, exp).
 * - Live expiry countdown; when it hits 0 the app dispatches `markExpired`.
 * - A "Verify signature" button recomputes the HMAC and reports the result.
 */
export default function JwtInspector() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [now, setNow] = useState(Date.now());
  const [verification, setVerification] = useState(null);

  // Tick once a second so the countdown stays live.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const decoded = decodeToken(token);
  const expired = decoded ? isTokenExpired(decoded.payload) : false;
  const remaining = decoded ? secondsUntilExpiry(decoded.payload) : 0;

  // Auto-logout the moment the token expires.
  useEffect(() => {
    if (token && expired) dispatch(markExpired());
  }, [token, expired, dispatch]);

  if (!token || !decoded) {
    return (
      <section className="card">
        <h2>2 · JWT Inspector</h2>
        <p className="muted">Log in above to generate a demo JWT and inspect it here.</p>
      </section>
    );
  }

  const [rawHeader, rawPayload, rawSignature] = token.split('.');

  const handleVerify = async () => {
    const result = await verifyDemoToken(token);
    setVerification(result);
  };

  return (
    <section className="card">
      <h2>2 · JWT Inspector</h2>
      <p>
        Token status:{' '}
        <strong className={expired ? 'error' : 'ok'}>
          {expired ? 'EXPIRED' : `VALID — expires in ${remaining}s`}
        </strong>
        {'  '}(updates every second; <code>now = {Math.floor(now / 1000)}</code>)
      </p>

      <h3>Raw token (header.payload.signature)</h3>
      <pre className="token">
        <span className="tok-header">{rawHeader}</span>.
        <span className="tok-payload">{rawPayload}</span>.
        <span className="tok-signature">{rawSignature}</span>
      </pre>

      <div className="two-col">
        <div>
          <h3>Header (decoded)</h3>
          <pre>{JSON.stringify(decoded.header, null, 2)}</pre>
        </div>
        <div>
          <h3>Payload — claims (decoded)</h3>
          <pre>{JSON.stringify(decoded.payload, null, 2)}</pre>
        </div>
      </div>

      <p className="muted">
        <code>iat</code> = issued at, <code>exp</code> = expires at (Unix seconds).
        The signature is HMAC-SHA256 of <code>header.payload</code> with the demo secret.
      </p>
      <button onClick={handleVerify}>Verify signature</button>
      {verification && (
        <p className={verification.valid ? 'ok' : 'error'}>
          {verification.valid ? '✓ ' : '✗ '}
          {verification.reason}
        </p>
      )}
    </section>
  );
}
