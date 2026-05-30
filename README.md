# ♟️ Chessables

A real-time multiplayer chess application built with modern web technologies. Play chess against opponents worldwide with live game updates, authentication, and a beautiful user interface

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mehul79/chessables)


[![Node](https://img.shields.io/badge/node-%E2%89%A518-brightgreen?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)
[![ws](https://img.shields.io/badge/ws-WebSocket-black?logo=websocket)](https://github.com/websockets/ws)
[![Region](https://img.shields.io/badge/Region-eu--north--1-1f73b7?logo=amazonaws&logoColor=white)](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

## 📋 Overview

Chessables is a full-stack chess application that enables real-time multiplayer chess games. The application features Google OAuth authentication, WebSocket-based real-time gameplay, PostgreSQL database for game persistence, and a modern React frontend with drag-and-drop chess board interactions.

## 🖼️ UI Showcase


<img src="UI_SS/2.png" width="500" />
<img src="UI_SS/4.png" width="500" />


---

## 🏗️ Architecture

### 🔧 Backend Server (Express.js + TypeScript)

- Google OAuth authentication with Passport.js
- RESTful API for user management and game settings
- Session management with JWT tokens
- Prisma ORM with PostgreSQL database

### 🌐 WebSocket Server (ws + TypeScript)

- Real-time game management and player matching
- Move validation using chess.js library
- Game state synchronization and persistence

### ⚛️ React Frontend (React 19 + TypeScript)

- Modern UI with Tailwind CSS and Radix UI
- Real-time updates via WebSocket
- Drag & drop chess board interactions
- Zustand state management and React Router DOM

### 🗄️ Database (PostgreSQL + Docker)

- User profiles and authentication data
- Complete game history with moves and timestamps
- Optimized queries with strategic indexing

## 🚀 Features

### Core Gameplay

- ✅ Real-time multiplayer chess games
- ✅ Drag-and-drop piece movement with validation
- ✅ Automatic opponent matching
- ✅ Game history and persistence

### Authentication & User Management

- ✅ Google OAuth integration
- ✅ User profile management
- ✅ Secure session-based authentication

### Technical Features

- ✅ WebSocket real-time communication
- ✅ PostgreSQL with Prisma ORM
- ✅ TypeScript for type safety
- ✅ Docker containerization
- ✅  Game Persistence

## 🔒 Game Persistence (Brief)

### What is stored
Every game’s canonical state is stored in the database:
- Current board position (FEN)
- Ordered move list with timestamps
- Per-move `timeTaken`
- Players, status, and result  

The database is the **single source of truth**.

---

### Reload / Hydration Flow
When the frontend opens `/game/:gameId`:
1. An HTTP API call fetches the saved game state (FEN, moves, clocks, players, status).
2. The frontend rebuilds the UI from this data:
   - Chess board
   - Move list
   - Timers
   - Player info  

This process is called **hydration**.

---

### Reattaching a Live Game
If the game status is `IN_PROGRESS`:
1. The frontend sends a `JOIN_GAME` WebSocket message.
2. The WebSocket server:
   - Reuses the existing in-memory `Game` instance **if it exists**, or
   - Loads moves from the database and calls `seedMoves()` to rebuild a fresh `Game` object.
3. The server attaches the new socket to the game room.
4. Live play continues seamlessly.

---

## 🛠️ Quick Setup

### Prerequisites

- Node.js (v18+), Docker, Google OAuth credentials

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend_1
npm install
# Add .env with Google OAuth and database credentials
npx prisma migrate dev && npx prisma generate
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend_1
npm install
npm run dev
```

### 🚀 Deployment (Render)

The backend is configured for easy deployment on Render:
1. **Service Type:** Web Service
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. **Environment Variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., from Supabase or Neon)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth credentials
   - `JWT_SECRET` / `COOKIE_SECRET`: Secure random strings
   - `AUTH_REDIRECT_URL`: `https://your-backend.onrender.com/auth/google/callback`
   - `ALLOWED_HOSTS`: `https://your-frontend.vercel.app`

### Environment Variables (.env)

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
JWT_SECRET="your_jwt_secret"
PORT=3000

# Backend callback route registered in Google Console
AUTH_REDIRECT_URL="http://localhost:3000/auth/google/callback"

# Frontend URL for CORS and post-login redirect
ALLOWED_HOSTS="http://localhost:5173"
```

## 🎯 Future Scope

### Enhanced Features

- ⏱️ Timer logic and move display on UI
- 🏆 Rating system and leaderboards
- 🎨 Custom themes and mobile optimization

### Technical Improvements

- 🗄️ Enhanced database integration with game logic
- ⚡ Redis queue for faster move storage
- ☁️ GCP deployment for production
- 🧪 Comprehensive testing suite

### Advanced Features

- 🤖 AI opponents with difficulty levels
- 📹 Game replay and analysis
- 💬 In-game chat system
- 🏛️ Tournament organization

## 👨‍💻 Author Notes

Built by Mehul Gupta as a creative chess platform and real-time gaming system. This project demonstrates modern web development practices including WebSocket communication, OAuth authentication, Prisma ORM, and containerized deployment.

## 📝 TODO

- [x] Integrate database with game logic for persistence
- [x] Deploy to GCP instance for production
- [ ] Create Redis queue for faster move storage
- [ ] Implement rating system and leaderboards
- [ ] Add Stockfish AI opponents

---

**Happy hacking!** ♟️

_Full API documentation and advanced features coming soon._
and its here
