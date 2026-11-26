import { createSlice } from '@reduxjs/toolkit';

/**
 * logSlice — records every dispatched action so the UI can show the
 * action history. The recording middleware in store.js dispatches
 * `recordAction` for each action it sees (except `recordAction` itself,
 * so it never loops).
 */
const initialState = {
  entries: [], // [{ id, type, time }]
};

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    recordAction(state, action) {
      state.entries.push({
        id: state.entries.length + 1,
        type: action.payload.type,
        time: action.payload.time,
      });
      // Keep the list short so the panel stays readable.
      if (state.entries.length > 12) state.entries.shift();
    },
  },
});

export const { recordAction } = logSlice.actions;
export default logSlice.reducer;
