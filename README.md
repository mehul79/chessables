# ♟️ Chessables

A real-time multiplayer chess application built with modern web technologies. Play chess against opponents worldwide with live game updates, authentication, and a beautiful user interface

## 📋 Overview

Chessables is a full-stack chess application that enables real-time multiplayer chess games. The application features Google OAuth authentication, WebSocket-based real-time gameplay, PostgreSQL database for game persistence, and a modern React frontend with drag-and-drop chess board interactions.

## 🖼️ UI Showcase


![UI](screens/2.png)
![UI](screens/3.png)
![UI](screens/4.png)

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

### Environment Variables (.env)

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
JWT_SECRET="your_jwt_secret"
APP_PORT=3000
WS_PORT=8080
AUTH_REDIRECT_URL="http://localhost:5173"
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

- [ ] Implement timer logic and move display on UI
- [ ] Integrate database with game logic for persistence
- [ ] Create Redis queue for faster move storage
- [ ] Deploy to GCP instance for production
- [ ] Improve UI/UX with cleaner design
- [ ] Add comprehensive testing suite
- [ ] Implement rating system and leaderboards
- [ ] Add game replay functionality

---

**Happy hacking!** ♟️

_Full API documentation and advanced features coming soon._
and its here
