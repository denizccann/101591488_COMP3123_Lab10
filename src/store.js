import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import notesReducer from './features/notes/notesSlice';
import logReducer, { recordAction } from './features/log/logSlice';

// Records every dispatched action in the log slice,
// so the UI can show the action history.
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

store.subscribe(() => {
  // console.log('STATE CHANGED:', store.getState());
});
