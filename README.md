# COMP3123 Lab Exercise 10 - React Redux and JWT

Deniz Can - 101591488

A small React application that demonstrates Redux and JSON Web Token (JWT) concepts.

## What the app does

The app has four sections:

1. Demo Login - Enter any username and password and pick a token lifetime (for example 60 seconds or 10 minutes). The app creates a JWT in the browser and stores it in Redux state. Logging out clears the token.

2. JWT Inspector - Shows the token that was created at login. It decodes the header and the payload, shows the claims (sub, name, iat, exp), and counts down the time left before the token expires. When the token expires, the app logs the user out automatically.

3. Protected Notes - This section only works when the user is logged in with a valid token. The user can add, toggle and delete notes. The notes are kept in Redux state. If there is no valid token, the notes stay hidden.

4. Redux Explorer - Shows the current Redux state and a log of the actions that were dispatched, so it is easy to see how the state changes when something happens in the app.

Note: this is a demo. The JWT is created and verified in the browser with a demo secret. There is no server and no real authentication.

## Redux concepts used

- State: one object that holds the whole application state (auth, notes and the action log).
- Store: created with configureStore from Redux Toolkit in src/store.js.
- Reducer: the slice reducers in src/features handle the state changes for auth, notes and log.
- Action: plain objects created by the slice action creators, for example login, logout, addNote.
- Dispatch: the components send actions to the store with useDispatch.
- Subscribe: the components read the state with useSelector, and the Redux Explorer shows the state and the action log updating live.

## JWT

A JWT has three parts separated by dots: header, payload and signature. The header says the token type and the algorithm (HS256). The payload holds the claims. The signature is created with HMAC-SHA256 using the demo secret. The helper functions for creating and decoding the token are in src/utils/jwt.js.

## How to run

npm install
npm run dev

Then open the address that Vite shows in the browser (usually http://localhost:5173).
