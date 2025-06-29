# ♟️ Chessables

A real-time multiplayer chess application built with modern web technologies. Play chess against opponents worldwide with live game updates, authentication, and a beautiful user interface.

## 📋 Overview

Chessables is a full-stack chess application that enables real-time multiplayer chess games. The application features Google OAuth authentication, WebSocket-based real-time gameplay, PostgreSQL database for game persistence, and a modern React frontend with drag-and-drop chess board interactions.

## 🏗️ Architecture

The project follows a microservices architecture with three main components:

### 🔧 Backend Server (Express.js + TypeScript)

- **Authentication System**: Google OAuth integration using Passport.js
- **RESTful API**: User management, game settings, and authentication endpoints
- **Session Management**: Secure cookie-based sessions with JWT tokens
- **Database Integration**: Prisma ORM with PostgreSQL for data persistence
- **CORS Configuration**: Configured for secure cross-origin requests

### 🌐 WebSocket Server (ws + TypeScript)

- **Real-time Game Management**: Handles live chess game sessions
- **Game State Management**: Manages active games, player connections, and game logic
- **Move Validation**: Uses chess.js library for move validation and game rules
- **Player Matching**: Automatic opponent matching system
- **Game Persistence**: Saves game moves and results to database

### ⚛️ React Frontend (React 19 + TypeScript)

- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **Real-time Updates**: WebSocket integration for live game updates
- **Drag & Drop**: Interactive chess board with piece movement
- **State Management**: Zustand for global state management
- **Routing**: React Router DOM for navigation between screens

## 🗄️ Database (PostgreSQL + Docker)

- **User Management**: User profiles, authentication data
- **Game Records**: Complete game history with moves, timestamps, and results
- **Move Tracking**: Detailed move logs with FEN positions and timing
- **Relationships**: Proper foreign key relationships between users and games
- **Indexing**: Optimized queries with strategic database indexes

## 🚀 Features

### Core Gameplay

- ✅ Real-time multiplayer chess games
- ✅ Drag-and-drop piece movement
- ✅ Move validation using chess.js
- ✅ Game state synchronization
- ✅ Automatic opponent matching
- ✅ Game history and persistence

### Authentication & User Management

- ✅ Google OAuth integration
- ✅ User profile management
- ✅ Session-based authentication
- ✅ Secure logout functionality
- ✅ Username customization

### Technical Features

- ✅ WebSocket real-time communication
- ✅ PostgreSQL database with Prisma ORM
- ✅ TypeScript for type safety
- ✅ Docker containerization
- ✅ Responsive design
- ✅ Modern React patterns

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Google OAuth credentials

### 1. Database Setup

```bash
# Start PostgreSQL database
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend_1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google OAuth credentials and database URL

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend_1

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"

# Authentication
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
JWT_SECRET="your_jwt_secret"
COOKIE_SECRET="your_cookie_secret"

# Server
APP_PORT=3000
WS_PORT=8080
AUTH_REDIRECT_URL="http://localhost:5173"

# CORS
ALLOWED_HOSTS="http://localhost:5173"
```

## 🎯 Future Scope

### Enhanced Gameplay Features

- ⏱️ **Timer Logic**: Implement chess clocks and time controls
- 📊 **Moves Display**: Show move history and notation on UI
- 🏆 **Rating System**: ELO rating calculations and leaderboards
- 🎨 **Custom Themes**: Multiple board and piece themes
- 📱 **Mobile Optimization**: Responsive design improvements

### Technical Improvements

- 🗄️ **Database Integration**: Enhanced game logic with database
- ⚡ **Redis Queue**: Faster move storage and processing
- ☁️ **GCP Deployment**: Production deployment on Google Cloud
- 🔄 **Real-time Analytics**: Game statistics and player insights
- 🧪 **Testing Suite**: Unit and integration tests

### Advanced Features

- 🤖 **AI Opponents**: Computer players with different difficulty levels
- 📹 **Game Replay**: Watch and analyze past games
- 💬 **Chat System**: In-game messaging between players
- 🏛️ **Tournaments**: Organized chess tournaments
- 📈 **Performance Analytics**: Detailed player statistics

## 👨‍💻 Author Notes

Built by Mehul Gupta as a creative chess platform and real-time gaming system. This project started as an exploration of WebSocket communication and evolved into a full-featured multiplayer chess application.

The application demonstrates modern web development practices including:

- Real-time communication with WebSockets
- Secure authentication with OAuth
- Database design with Prisma ORM
- Modern React patterns and state management
- Containerized deployment with Docker

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
