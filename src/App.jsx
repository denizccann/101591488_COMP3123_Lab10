import LoginPanel from './components/LoginPanel';
import JwtInspector from './components/JwtInspector';
import ProtectedNotes from './components/ProtectedNotes';
import ReduxExplorer from './components/ReduxExplorer';

export default function App() {
  return (
    <main className="app">
      <header>
        <h1>React Redux + JWT — Demo App</h1>
        <p>
          COMP3123 Lab Exercise 10 · Deniz Can (101591488) · George Brown College
        </p>
        <p className="muted">
          A small app that demonstrates the six Redux concepts (State, Store,
          Reducer, Action, Dispatch, Subscribe) and JSON Web Tokens: demo login,
          token inspection, expiry countdown, a protected page, and a
          Redux-managed notes list.
        </p>
        <p className="demo-note">
          ⚠️ Demo only: the JWT is created and verified in the browser with a
          hard-coded demo secret. There is no server and no real authentication.
        </p>
      </header>

      <LoginPanel />
      <JwtInspector />
      <ProtectedNotes />
      <ReduxExplorer />

      <footer className="muted">
        How to try it: 1) Log in (any name works) → 2) inspect the JWT and watch
        the countdown → 3) open the protected notes and add/toggle/delete notes
        → 4) watch the live state and action log update. Try the 60-second
        token to see auto-logout on expiry.
      </footer>
    </main>
  );
}
