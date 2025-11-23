# README Update Suggestion

## Suggested Addition to Main README.md

Add this section after the "Features to be Implemented" section in the main README.md:

---

## 🆕 Turn-Based Timer System

Game Tracker now includes a real-time turn-based timer system for managing player time during game sessions!

### Features

- ⏱️ **Per-Player Time Tracking**: Each player starts with a configurable amount of time (e.g., 30 minutes)
- 🎯 **Turn-Based Countdown**: Timer runs only during a player's own turn
- 🔄 **Real-Time Sync**: All players see the same timer state instantly via WebSocket
- 💾 **Persistent State**: Timer survives page refreshes
- ⏸️ **Pause/Resume**: Temporarily stop and restart timers
- 📱 **Multi-Device**: View and control from multiple devices simultaneously

### Quick Start

1. **Start a game session** and navigate to the session page
2. **Enable the timer** in the "Turn-Based Timer" section
3. **Set default time** per player (e.g., 30 minutes)
4. **Click "Pass Turn"** after each turn to switch to the next player

### Documentation

- 📖 [Usage Guide](./TURN_TIMER_USAGE.md) - Step-by-step instructions for players
- 🏗️ [Architecture](./TURN_TIMER_ARCHITECTURE.md) - Technical documentation for developers
- 🚀 [Setup & Deployment](./WEBSOCKET_SETUP.md) - Installation and deployment guide
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete overview

---

## Updated Getting Started Section

Replace the existing "Getting Started" section with:

---

## Getting Started

To use Game Tracker, follow these steps:

1. **Clone this repository** to your local machine:
   ```bash
   git clone https://github.com/olejri/gametracker.git
   cd gametracker
   ```

2. **Install the required dependencies**:
   ```bash
   npm install
   ```

3. **Obtain an API key** from [boardgameatlas.com](https://www.boardgameatlas.com/api/docs)

4. **Set up environment variables**:
   - Create a `.env` file in the root directory
   - Copy the contents from `.env.example`
   - Add your API keys and database connection:
     ```env
     DATABASE_URL="your_database_url"
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
     CLERK_SECRET_KEY="your_clerk_secret"
     # ... other required variables
     ```

5. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

6. **Run database migrations** (if needed):
   ```bash
   npx prisma migrate dev
   ```

7. **Start the application**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

> **Note**: This application uses a custom Next.js server with Socket.io for real-time features. See [WEBSOCKET_SETUP.md](./WEBSOCKET_SETUP.md) for deployment details.

---

## Updated Features Section

Replace "Features to be Implemented" with:

---

## Features

### Core Functionality
- ✅ Add games to your collection
- ✅ Search for games by name using the boardgameatlas.com API
- ✅ View game details and reviews
- ✅ Start game sessions with friends
- ✅ Track session results
- ✅ View game session history
- ✅ Filter game history by game title or player name with searchable dropdowns

### Advanced Features
- ✅ **Turn-Based Timer System**: Real-time per-player time tracking
- ✅ **Real-Time Synchronization**: WebSocket-powered live updates
- ✅ **Randomization Tools**: Roll seats and starting player
- ✅ **Player Statistics**: Track wins, plays, and performance
- ✅ **Game Groups**: Organize sessions by group
- ✅ **Export Data**: Export game history to CSV

### Recently Added
- 🆕 **Turn-Based Timer** (Latest): Real-time timer system with per-player countdown
- 🆕 **WebSocket Support**: Real-time multiplayer synchronization
- 🆕 **Pause/Resume Timers**: Flexible timer controls during gameplay

---

## New Technology Stack Section

Add this new section:

---

## Technology Stack

### Frontend
- **Next.js 13** - React framework with SSR and SSG
- **React 18** - UI component library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **tRPC** - End-to-end typesafe APIs

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **tRPC** - Type-safe API layer
- **Prisma** - Database ORM
- **MySQL** - Production database
- **Socket.io** - Real-time WebSocket communication

### Real-Time Features
- **Custom Next.js Server** - Integrates Socket.io with Next.js
- **Socket.io** - Bidirectional WebSocket communication
- **React Context** - WebSocket connection management
- **Custom Hooks** - Real-time state management

### Authentication & Authorization
- **Clerk** - User authentication and management

### External APIs
- **BoardGameAtlas API** - Game information and search

---

## Quick Links Section

Add after Technology Stack:

---

## Quick Links

### For Players
- 📖 [Turn Timer Usage Guide](./TURN_TIMER_USAGE.md)

### For Developers
- 🏗️ [Turn Timer Architecture](./TURN_TIMER_ARCHITECTURE.md)
- 🚀 [WebSocket Setup Guide](./WEBSOCKET_SETUP.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [tRPC Documentation](https://trpc.io/docs)

---

## Development Commands Section

Add this section:

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (with WebSocket support)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## Deployment Section

Add after Contributing:

---

## Deployment

This application uses a custom server with Socket.io for real-time features. See [WEBSOCKET_SETUP.md](./WEBSOCKET_SETUP.md) for detailed deployment instructions.

### Supported Platforms
- ✅ Vercel (with custom server configuration)
- ✅ Railway
- ✅ Render
- ✅ Docker
- ✅ AWS/GCP VM or container services

### Scaling
For multiple server instances, configure Redis adapter for shared WebSocket state. See the [setup guide](./WEBSOCKET_SETUP.md#scaling-considerations) for details.

---

## Updated License Section

Keep the existing license section, but add this note at the bottom of the README:

---

## Acknowledgments

- Game data provided by [Board Game Atlas](https://www.boardgameatlas.com/)
- Authentication powered by [Clerk](https://clerk.com/)
- Real-time features powered by [Socket.io](https://socket.io/)

---

## End of Suggested Updates

These updates will:
1. Highlight the new turn-based timer system
2. Update getting started instructions for the custom server
3. Add comprehensive feature list
4. Document the technology stack
5. Provide quick links to documentation
6. Include development and deployment commands
