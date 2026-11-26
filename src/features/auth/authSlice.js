import { createSlice } from '@reduxjs/toolkit';

/**
 * authSlice — Redux slice for authentication state.
 *
 * REDUX CONCEPT MAP (this file):
 * - STATE:    the `initialState` object below is part of the global state tree.
 * - REDUCER:  `loginSuccess` and `logout` are reducers — pure functions that
 *             take the current state + an action and return the next state.
 * - ACTION:   Redux Toolkit auto-generates action creators from the reducers
 *             (e.g. `loginSuccess({ token, user })` produces
 *             `{ type: 'auth/loginSuccess', payload: {...} }`).
 * - DISPATCH: components call `dispatch(loginSuccess(...))` to send actions.
 * - SUBSCRIBE: components read this slice with `useSelector(state => state.auth)`.
 */
const initialState = {
  user: null, // { id, name, email } when logged in, else null
  token: null, // demo JWT string when logged in, else null
  status: 'logged-out', // 'logged-out' | 'logged-in' | 'expired'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Store the demo JWT + user after a successful (demo) login.
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'logged-in';
      state.error = null;
    },
    // Clear everything on logout.
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'logged-out';
      state.error = null;
    },
    // Mark the session expired when the token's `exp` claim passes.
    markExpired(state) {
      state.user = null;
      state.token = null;
      state.status = 'expired';
      state.error = 'Your demo token has expired. Please log in again.';
    },
  },
});

export const { loginSuccess, logout, markExpired } = authSlice.actions;
export default authSlice.reducer;
