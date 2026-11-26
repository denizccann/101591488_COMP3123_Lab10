import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { createDemoToken } from '../utils/jwt';

/**
 * LoginPanel — demo login form.
 *
 * There is NO server here. On submit it creates a client-side demo JWT
 * (see utils/jwt.js) and DISPATCHes `loginSuccess` with the token.
 * Any name/email works; the demo account button fills in a preset user.
 * Token lifetime is selectable (60 s / 5 min) so the expiry countdown
 * and the auto-logout can be demonstrated quickly.
 */
export default function LoginPanel() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [name, setName] = useState('Deniz Can');
  const [email, setEmail] = useState('101591488@georgebrown.ca');
  const [lifetime, setLifetime] = useState(300);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const demoUser = { id: '101591488', name: name.trim() || 'Demo User', email: email.trim() };
      const token = await createDemoToken(demoUser, lifetime);
      dispatch(loginSuccess({ token, user: demoUser }));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => dispatch(logout());

  if (status === 'logged-in' && user) {
    return (
      <section className="card">
        <h2>1 · Demo Login</h2>
        <p>
          Logged in as <strong>{user.name}</strong> ({user.email}).
        </p>
        <p className="muted">
          Status in Redux state: <code>auth.status = &quot;logged-in&quot;</code>
        </p>
        <button onClick={handleLogout}>Log out (clears the token)</button>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>1 · Demo Login</h2>
      <p>
        This is a <strong>client-side demo</strong> — there is no auth server.
        Logging in creates a JWT in the browser and stores it in Redux.
      </p>
      {status === 'expired' && error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Token lifetime
          <select value={lifetime} onChange={(e) => setLifetime(Number(e.target.value))}>
            <option value={60}>60 seconds (quick expiry demo)</option>
            <option value={300}>5 minutes</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Creating token…' : 'Log in & create demo JWT'}
        </button>
      </form>
    </section>
  );
}
