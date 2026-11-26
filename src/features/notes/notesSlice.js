import { createSlice } from '@reduxjs/toolkit';

/**
 * notesSlice — Redux slice for a small notes list.
 * This is the "Redux-managed piece of state" of the app. It lives in the
 * store, is changed only by dispatching actions, and every component that
 * reads it re-renders when it changes (Subscribe).
 *
 * - STATE:    `items` array (+ `nextId` counter) inside the global state tree.
 * - REDUCER:  `addNote`, `toggleNote`, `deleteNote` — pure state transitions.
 * - ACTION:   auto-generated creators, e.g. `addNote({ text: '...' })`.
 * - DISPATCH: the NotesList component dispatches these actions.
 * - SUBSCRIBE: NotesList reads the list with useSelector.
 */
let nextId = 4;

const initialState = {
  items: [
    { id: 1, text: 'Read the Redux docs: State, Store, Reducer, Action, Dispatch, Subscribe', done: true },
    { id: 2, text: 'Decode a JWT: header, payload, signature', done: true },
    { id: 3, text: 'Log in and watch the token countdown expire', done: false },
  ],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote(state, action) {
      state.items.push({ id: nextId++, text: action.payload.text, done: false });
    },
    toggleNote(state, action) {
      const note = state.items.find((item) => item.id === action.payload.id);
      if (note) note.done = !note.done;
    },
    deleteNote(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
  },
});

export const { addNote, toggleNote, deleteNote } = notesSlice.actions;
export default notesSlice.reducer;
