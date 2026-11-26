import { useSelector } from 'react-redux';

/**
 * ReduxExplorer — makes the invisible Redux flow visible.
 * - Live state: the whole store as JSON (re-renders on every change —
 *   this is SUBSCRIBE via useSelector).
 * - Action log: every ACTION that was DISPATCHed, newest last.
 * - Concept map: where each of the 6 Redux concepts lives in this app.
 */
const CONCEPTS = [
  { name: '0 · State', where: 'One plain object: { auth, notes, log }. See the live JSON below.' },
  { name: '1 · Store', where: 'src/store.js — configureStore() combines the slice reducers.' },
  { name: '2 · Reducer', where: 'authSlice, notesSlice, logSlice — pure functions (state, action) => next state.' },
  { name: '3 · Action', where: 'e.g. { type: "notes/addNote", payload: { text } } — auto-created by createSlice.' },
  { name: '4 · Dispatch', where: 'dispatch(addNote(...)) in ProtectedNotes, dispatch(loginSuccess(...)) in LoginPanel.' },
  { name: '5 · Subscribe', where: 'useSelector(state => ...) in every component + store.subscribe() in store.js.' },
];

export default function ReduxExplorer() {
  const state = useSelector((state) => state);
  const entries = useSelector((state) => state.log.entries);

  // Hide the token string in the pretty JSON (it is long); show its length.
  const displayState = {
    ...state,
    auth: {
      ...state.auth,
      token: state.auth.token ? `<demo JWT, ${state.auth.token.length} chars — see JWT Inspector>` : null,
    },
  };

  return (
    <section className="card">
      <h2>4 · Redux Explorer — State, Actions, Subscribe</h2>

      <h3>The 6 Redux concepts in this app</h3>
      <table>
        <thead>
          <tr>
            <th>Concept</th>
            <th>Where it lives in this code</th>
          </tr>
        </thead>
        <tbody>
          {CONCEPTS.map((c) => (
            <tr key={c.name}>
              <td><strong>{c.name}</strong></td>
              <td>{c.where}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Live Redux state (updates on every dispatch — Subscribe)</h3>
      <pre>{JSON.stringify(displayState, null, 2)}</pre>

      <h3>Dispatched actions (most recent last)</h3>
      {entries.length === 0 ? (
        <p className="muted">No actions yet — log in or add a note to see actions appear.</p>
      ) : (
        <ol className="action-log">
          {entries.map((entry) => (
            <li key={entry.id}>
              <code>{entry.type}</code> <span className="muted">at {entry.time}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
