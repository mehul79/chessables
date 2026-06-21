# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Database
```bash
docker-compose up -d                          # start local PostgreSQL
```

### Backend (`cd backend_1`)
```bash
npm run dev                                   # dev server with nodemon
npm run build                                 # prisma generate + tsc
npm start                                     # run compiled dist/index.js
npx prisma migrate dev --name <migration>     # create + apply migration
npx prisma studio                             # browse DB in browser
```

### Frontend (`cd frontend_1`)
```bash
npm run dev                                   # Vite dev server (port 5173)
npm run build                                 # tsc + vite build
npm run lint                                  # eslint
```

## Environment Variables

**Backend** (`backend_1/.env`, see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials
- `JWT_SECRET` / `COOKIE_SECRET` — signing secrets
- `AUTH_REDIRECT_URL` — Google OAuth callback (`/auth/google/callback`)
- `PORT` — defaults to 3000

**Frontend** (`frontend_1/.env`):
- `VITE_APP_BACKEND_URL` — HTTP backend URL (default: `http://localhost:3000`)
- `VITE_WS_URL` — WebSocket URL (default: `ws://localhost:3000`)

## Architecture

### Two-process model
The Express HTTP server and the `ws` WebSocket server share a single `http.Server` instance (`backend_1/src/index.ts`). HTTP handles auth and game queries; WebSocket handles all real-time game events.

### WebSocket message flow
All WS messages are plain JSON with a `type` field. Constants live in `src/messages.ts`.

| Client → Server | Effect |
|---|---|
| `init_game` | Matchmaking — creates a `Game` or joins the pending one |
| `join_game` | Reattach socket to an existing `IN_PROGRESS` game (hydration) |
| `move` | Validate + apply move, persist to DB, broadcast to both players |
| `resign` / `exit_game` | End the game immediately |

### Core backend classes
- **`Game`** (`src/Game.ts`) — wraps a `chess.js` instance, owns two Node timers (abandon + move-time-up), writes moves to DB non-blocking, broadcasts via `socketManager`.
- **`GameManager`** (`src/GameManager.ts`) — holds the in-memory `Game[]`, owns `pendingGameId` for matchmaking, routes WS messages to the right game.
- **`SocketManager`** (`src/SocketManager.ts`) — singleton; maps `gameId → User[]` and `userId → roomId` for targeted broadcasts.

### Game persistence / hydration
Database is the single source of truth. On `JOIN_GAME`, `GameManager` checks if the game is already in memory; if not, it rehydrates it from the DB via `game.seedMoves()`. The frontend does a REST fetch of full game state (FEN, moves, clocks) before connecting the WebSocket.

### Frontend state
- **`useUserStore`** / **`useGameStore`** (Zustand, `src/stores/game.store.ts`) — global auth and game state.
- **`useSocket`** (`src/hooks/useSocket.ts`) — creates the WS connection using `user.token` as a query param; the backend validates the JWT before accepting the connection.
- Routes: `/` Landing → `/login` → `/game` GameLobby (matchmaking) → `/game/:gameId` GameRoom (live board).

### Auth flow
Google OAuth via Passport.js. After OAuth callback, the backend issues a JWT stored in an httpOnly session cookie. The JWT is also sent to the frontend as `token` in the `/auth/refresh` response and used as `?token=` in the WS handshake.

### Database schema
Three models: `User`, `Game`, `Move`. `Game.status` enum: `IN_PROGRESS | COMPLETED | ABANDONED | TIME_UP | PLAYER_EXIT`. Moves store `before`/`after` FEN per move plus `timeTaken` (ms).
