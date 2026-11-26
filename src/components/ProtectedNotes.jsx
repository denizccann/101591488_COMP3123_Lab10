import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNote, deleteNote, toggleNote } from '../features/notes/notesSlice';

/**
 * ProtectedNotes — the PROTECTED PAGE + the Redux-managed notes list.
 *
 * - The whole section only renders its content when a valid, unexpired
 *   token is in the store; otherwise it shows "Access denied".
 * - The notes list is the Redux-managed state: it is read with
 *   useSelector (SUBSCRIBE) and changed only by DISPATCHing the slice's
 *   ACTIONS (addNote / toggleNote / deleteNote), which run through its
 *   REDUCER. Editing is disabled while logged out.
 */
export default function ProtectedNotes() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const items = useSelector((state) => state.notes.items);
  const [text, setText] = useState('');

  const loggedIn = Boolean(token);

  const handleAdd = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(addNote({ text: trimmed }));
    setText('');
  };

  return (
    <section className="card">
      <h2>3 · Protected Page — Notes (Redux state)</h2>
      {!loggedIn ? (
        <p className="error">
          🔒 Access denied — this page is protected. Log in to get a demo JWT
          and unlock it. (The guard is <code>state.auth.token</code>.)
        </p>
      ) : (
        <>
          <p className="ok">✓ Token present — protected content unlocked.</p>
          <p className="muted">
            These notes live in the Redux store (<code>state.notes.items</code>).
            Add / check / delete dispatches actions through the notes reducer.
          </p>
          <form onSubmit={handleAdd} className="inline-form">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a note…"
              aria-label="New note"
            />
            <button type="submit">Add note</button>
          </form>
          <ul className="notes">
            {items.map((note) => (
              <li key={note.id} className={note.done ? 'done' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={note.done}
                    onChange={() => dispatch(toggleNote({ id: note.id }))}
                  />
                  {note.text}
                </label>
                <button
                  className="small"
                  onClick={() => dispatch(deleteNote({ id: note.id }))}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
