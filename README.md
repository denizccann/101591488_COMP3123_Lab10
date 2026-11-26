# COMP3123 Lab Exercise 10 — React Redux + JWT Demo App

**Course:** COMP3123 — Full-Stack Web Development (George Brown College)
**Student:** Deniz Can (101591488)
**Due:** Sunday, November 29, 2026, 11:59 PM
**Lab topic:** Self-Directed Research and Innovation — React Redux and JWT (JSON Web Token)

A small React application that demonstrates the six Redux concepts
(State, Store, Reducer, Action, Dispatch, Subscribe) and JWT
authentication — with a demo login, token inspection, an expiry countdown,
a protected page, and a Redux-managed notes list.

> ⚠️ **Demo only:** the JWT is created and verified entirely in the browser
> with a hard-coded demo secret. There is no server and no real
> authentication. This is intentional for the lab — see
> [“Why this is not production auth”](#why-this-is-not-production-auth).

---

## 1. How to run it

Prerequisites: Node.js 18+ and npm.

```bash
npm install     # install dependencies (react, react-redux, @reduxjs/toolkit)
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # production build (output in dist/)
npm run preview # serve the production build (http://localhost:4173)
```

No environment variables, no database, no backend server are needed.

## 2. How to try it (guided tour)

1. **Log in** (Section 1) — any name/email works; there is no server.
   Choose a token lifetime: **60 seconds** to watch expiry happen quickly,
   or **5 minutes**. Logging in creates a demo JWT and stores it in Redux.
2. **Inspect the JWT** (Section 2) — the raw token is shown colour-coded as
   `header.payload.signature`, with the decoded header and payload (claims)
   next to it. A live countdown shows the seconds until `exp`. Click
   **Verify signature** to recompute the HMAC and check the token.
3. **Open the protected page** (Section 3) — the notes list is locked until
   you log in. Add, check off, and delete notes. Every change goes through
   Redux. When the token expires, the app logs you out automatically and
   the page locks again.
4. **Watch Redux work** (Section 4) — the live state tree (JSON) and the
   list of every dispatched action update in real time.

## 3. Project structure

```
comp3123-lab10/
├── index.html                  # Page title + root div
├── package.json                # react, react-redux, @reduxjs/toolkit, vite
├── src/
│   ├── main.jsx                # React root; <Provider store={store}>
│   ├── store.js                # THE STORE + action-logging middleware
│   ├── App.jsx                 # Page layout (4 sections)
│   ├── index.css               # Styling
│   ├── utils/
│   │   └── jwt.js              # Demo JWT: create / decode / verify (HMAC-SHA256)
│   ├── features/
│   │   ├── auth/authSlice.js   # Auth state: user, token, status
│   │   ├── notes/notesSlice.js # Notes state: items list
│   │   └── log/logSlice.js     # Action-history state (for the Explorer)
│   └── components/
│       ├── LoginPanel.jsx      # Demo login form / logout
│       ├── JwtInspector.jsx    # Token display, decoded claims, countdown
│       ├── ProtectedNotes.jsx  # Protected page + Redux notes list
│       └── ReduxExplorer.jsx   # Live state JSON + action log + concept map
└── README.md
```

## 4. Redux — the six concepts, mapped to this code

### 0 · State
State is the data of the application, kept in **one plain JavaScript
object** — the state tree. In this app it looks like this:

```js
{
  auth:  { user: { id, name, email } | null, token: string | null,
           status: 'logged-out' | 'logged-in' | 'expired', error: string | null },
  notes: { items: [ { id, text, done }, ... ] },
  log:   { entries: [ { id, type, time }, ... ] }
}
```

Each top-level key belongs to one *slice* (`authSlice`, `notesSlice`,
`logSlice`). Components never keep their own copy of this data — the
store is the single source of truth.

### 1 · Store
The store is the object that **holds** the state and coordinates all
changes. It is created once, in `src/store.js`:

```js
export const store = configureStore({
  reducer: { auth: authReducer, notes: notesReducer, log: logReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(actionLoggerMiddleware),
});
```

`configureStore` (Redux Toolkit) combines the slice reducers, adds the
Redux DevTools integration and thunk middleware by default. The app is
connected to it in `src/main.jsx` with `<Provider store={store}>`, which
makes the store available to every component.

### 2 · Reducer
A reducer is a **pure function** `(state, action) => nextState`: given the
current state and an action, it returns the next state — it never mutates
outside data and never has side effects. Each slice defines its reducers
with `createSlice`. Example from `notesSlice.js`:

```js
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
}
```

(Writing `state.items.push(...)` looks like mutation, but Redux Toolkit
uses Immer, so it produces a new immutable state under the hood.)

### 3 · Action
An action is a plain object describing *what happened*:
`{ type: 'notes/addNote', payload: { text: '...' } }`. The `type` names
the event; the `payload` carries the data. `createSlice` auto-generates
**action creator functions** from the reducers, so `addNote({ text })`
produces the action object above — components never hand-write type
strings.

### 4 · Dispatch
Dispatch is the **only** way to change the state: a component sends an
action to the store with `dispatch(...)`, the store runs it through the
reducers, and the state updates. Examples:

```js
dispatch(loginSuccess({ token, user })); // LoginPanel.jsx — after creating the JWT
dispatch(addNote({ text }));             // ProtectedNotes.jsx — adding a note
dispatch(logout());                      // LoginPanel.jsx — logout clears the token
dispatch(markExpired());                 // JwtInspector.jsx — token expired
```

### 5 · Subscribe
Subscribe means “notify me when the state changes”. React-Redux does this
with the `useSelector` hook — the component re-renders whenever the piece
of state it reads changes:

```js
const token = useSelector((state) => state.auth.token);   // JwtInspector, ProtectedNotes
const items = useSelector((state) => state.notes.items);  // ProtectedNotes
const state = useSelector((state) => state);               // ReduxExplorer (whole tree)
```

The app also calls `store.subscribe()` directly in `store.js` (the
low-level API), and the Redux Explorer section shows the live state tree
and the action log as visible proof that subscribing works.

### Data flow, end to end (adding a note)
1. User types a note and clicks **Add note** → `dispatch(addNote({ text }))`
2. The store sends the action `{ type: 'notes/addNote', payload }` to the
   `notes` reducer → the reducer returns the new state with the note added.
3. Every component subscribed with `useSelector` re-renders: the note
   appears in the list, the live state JSON updates, and the action log
   gains a `notes/addNote` entry.

## 5. JWT (JSON Web Token)

### Structure — three Base64URL parts
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  .  eyJzdWIiOiIxMDE1OTE0ODgiLCJuYW1lIjoi...  .  SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
<──────────── header ────────────>     <──────────── payload (claims) ────────────>     <── signature ──>
```

* **Header** — metadata about the token itself:
  `{ "alg": "HS256", "typ": "JWT" }` (HMAC-SHA256 signature algorithm).
* **Payload (claims)** — the data the token carries, e.g.
  `{ "sub": "101591488", "name": "Deniz Can", "email": "…",
     "role": "student", "iat": 1764…, "exp": 1764… }`.
  Standard claims used here: `sub` (subject = user id), `iat` (issued
  at), `exp` (expires at, Unix seconds). **Claims are only Base64-encoded,
  not encrypted — anyone can read them. Never put secrets in a JWT.**
* **Signature** — `HMAC-SHA256( base64url(header) + "." + base64url(payload), secret )`.
  It is computed over the first two parts, so if anyone edits the payload
  (e.g. changes `role` to `admin`), the signature no longer matches and
  verification fails. The signature is what makes a JWT tamper-evident.

### How the demo uses JWT
* **Login** (`LoginPanel.jsx` → `utils/jwt.js` `createDemoToken`) builds
  the header and payload, signs them with HMAC-SHA256 via the Web Crypto
  API, and stores the resulting token string in Redux (`auth.token`).
* **Inspect** (`JwtInspector.jsx`) splits the token, Base64URL-decodes the
  header and payload, and displays the claims. A 1-second timer shows the
  live countdown to `exp`.
* **Verify** — the **Verify signature** button recomputes the HMAC and
  compares it (`verifyDemoToken`): it reports “signature valid” or
  “signature mismatch — the token was tampered with”.
* **Protect** — the notes page renders only when `state.auth.token` exists
  (`ProtectedNotes.jsx`). Logging out dispatches `logout()` and clears the
  token from the store, so the page locks again.
* **Expire** — when the countdown reaches the `exp` claim, the app
  dispatches `markExpired()`, clears the token, and shows “Your demo token
  has expired.” A 60-second token lifetime is offered so this can be
  watched in under a minute.

### Why this is not production auth
* The signing secret (`comp3123-lab10-demo-secret` in `src/utils/jwt.js`)
  is hard-coded in the browser bundle — **anyone can read it and forge a
  token**. A real system keeps the secret only on the server and issues
  tokens from a login endpoint.
* There is no server, no password check, and no user database — any
  name/email logs in.
* A real app would store the token in an HttpOnly cookie (not in Redux /
  localStorage, where JavaScript can read it), use short-lived access
  tokens + refresh tokens, verify the token on every API request
  server-side, and use HTTPS everywhere.

## 6. What I learned (research summary)
* **Redux** centralises state: one store, state changed only by dispatched
  actions through pure reducers, components subscribe with `useSelector`.
  Redux Toolkit (`createSlice`, `configureStore`) removes most of the
  boilerplate of classic Redux.
* **JWT** is a compact, self-contained, signed token format: header,
  payload, signature. It is good for stateless authentication because the
  server can verify a token without a database lookup — but it is only as
  safe as the secrecy of the signing key, and its payload is readable by
  anyone.
* **Redux + JWT together:** the token lives in the Redux store
  (`auth.token`); the UI (protected routes, login/logout) reacts to it
  through subscription; actions (`loginSuccess` / `logout` / `markExpired`)
  are the only way the token state changes.

## 7. Submission contents
* Public GitHub repository link: https://github.com/denizccann/101591488_COMP3123_Lab10
* Screenshots / demo video: *(to be added separately)*
* Code: this project (see `code.zip` in the submission folder)
