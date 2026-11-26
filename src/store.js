import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import notesReducer from './features/notes/notesSlice';
import logReducer, { recordAction } from './features/log/logSlice';

/**
 * STORE — the single source of truth.
 *
 * The store holds the whole application STATE in one plain JavaScript
 * object:
 *   {
 *     auth:  { user, token, status, error },
 *     notes: { items: [...] },
 *     log:   { entries: [...] }
 *   }
 *
 * `configureStore` wires the slice REDUCERS together (combineReducers
 * under the hood) and adds the Redux DevTools + thunk middleware by
 * default. Every state change happens by DISPATCHing an ACTION to this
 * store; components SUBSCRIBE to it with useSelector (or store.subscribe).
 */

// Middleware that records every dispatched action (except its own)
// into the `log` slice, so the UI can display the action history.
const actionLoggerMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (action.type !== recordAction.type) {
    storeApi.dispatch(
      recordAction({
        type: action.type,
        time: new Date().toLocaleTimeString('en-CA'),
      }),
    );
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
    log: logReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(actionLoggerMiddleware),
});

// SUBSCRIBE — literal store.subscribe demo: log every state change.
// (React components subscribe the idiomatic way, with useSelector.)
store.subscribe(() => {
  // Open the browser console to watch the state change on every dispatch.
  // console.log('STATE CHANGED:', store.getState());
});
