# Turn-Based Timer System Architecture

## Overview

This document describes the real-time WebSocket-based turn timer system implemented for the Game Tracker application. The system enables multiplayer game sessions with per-player time tracking, where each player has a fixed total time (e.g., 30 minutes) that counts down only during their turn.

## Tech Stack Compatibility

The existing tech stack **fully supports** the turn-based timer system:

- ✅ **Next.js 13**: Custom server integration allows Socket.io to run alongside Next.js
- ✅ **tRPC**: Continues to handle API calls for game session data and timer initialization
- ✅ **Prisma**: Extended schema stores turn state and per-player time data
- ✅ **React**: Socket.io client integrates seamlessly with React hooks and context
- ✅ **Socket.io**: Provides bidirectional real-time communication for timer synchronization

## Architecture Components

### 1. Database Schema (Prisma)

**Extended Models:**

```prisma
model GameSession {
  turnBasedTimerEnabled Boolean     @default(false)
  currentTurnPlayerId   String?
  turnStartedAt         DateTime?
  defaultPlayerTimeMs   Int?        // Default time per player (e.g., 1800000ms = 30min)
  // ... other fields
}

model PlayerGameSessionJunction {
  remainingTimeMs Int?  // Remaining time in milliseconds for this player
  // ... other fields
}
```

### 2. WebSocket Server (server.js)

**Purpose**: Manages real-time communication and turn state synchronization

**Key Features**:
- Custom Next.js server with Socket.io integration
- Room-based architecture (one room per game session)
- In-memory session state for active timers
- Event-driven turn management

**Socket Events**:
- `join-session`: Client joins a game session room
- `leave-session`: Client leaves a game session room
- `start-timer`: Starts timer for current player
- `pass-turn`: Passes turn to next player
- `pause-timer`: Pauses current player's timer
- `resume-timer`: Resumes current player's timer
- `end-timer`: Ends timer for the session
- `timer-started`: Broadcast when timer starts
- `turn-changed`: Broadcast when turn passes to next player
- `timer-paused`: Broadcast when timer is paused
- `timer-resumed`: Broadcast when timer resumes
- `timer-ended`: Broadcast when timer ends
- `player-time-expired`: Broadcast when a player's time expires

### 3. tRPC API Router (turntimer.ts)

**Purpose**: Handles database operations and session state persistence

**Endpoints**:

```typescript
initializeTurnTimer(sessionId, defaultPlayerTimeMs, playerIds)
  - Initializes timer for a session
  - Sets default time for all players
  - Returns initial state

getTimerState(sessionId)
  - Fetches current timer state from database
  - Returns session and player time data

updatePlayerTime(junctionId, remainingTimeMs)
  - Updates a player's remaining time in database

passTurn(sessionId, currentPlayerId, nextPlayerId, timeUsedMs)
  - Updates current player's remaining time
  - Changes turn to next player
  - Updates database

disableTurnTimer(sessionId)
  - Disables timer for a session
```

### 4. React Context (SocketContext.tsx)

**Purpose**: Provides Socket.io connection to React components

**Features**:
- Single WebSocket connection for entire app
- Automatic connection/disconnection management
- Connection state tracking

**Usage**:
```typescript
const { socket, isConnected } = useSocket();
```

### 5. Custom React Hook (useTurnTimer.ts)

**Purpose**: Encapsulates timer logic and WebSocket communication

**Features**:
- Real-time countdown calculation
- Automatic session room joining
- Socket event handling
- Timer control functions

**API**:
```typescript
const {
  currentPlayerId,           // ID of player whose turn it is
  players,                   // Array of all players with remaining times
  isActive,                  // Whether timer is running
  currentPlayerRemainingTime,// Current player's remaining time (ms)
  startTimer,                // Start timer for a player
  passTurn,                  // Pass turn to next player
  pauseTimer,                // Pause current timer
  resumeTimer,               // Resume paused timer
  endTimer                   // End timer for session
} = useTurnTimer({...});
```

### 6. UI Component (TurnTimer.tsx)

**Purpose**: Provides user interface for timer management

**Features**:
- Initialize timer with custom default time
- Display current player's countdown
- Pass turn button
- Pause/resume controls
- Player list with remaining times
- Visual indicators for expired time
- Enable/disable timer

## Data Flow

### Initializing a Timer

1. User clicks "Enable Timer" in UI
2. User sets default time (e.g., 30 minutes)
3. `TurnTimer` calls `initializeTurnTimer` mutation (tRPC)
4. Server updates database:
   - Sets `turnBasedTimerEnabled = true`
   - Sets `currentTurnPlayerId` to first player
   - Sets `defaultPlayerTimeMs` for all players
5. `useTurnTimer` hook receives updated state
6. Hook emits `start-timer` to WebSocket server
7. Server broadcasts `timer-started` to all clients in room
8. All clients update their UI in real-time

### Passing a Turn

1. User clicks "Pass Turn" button
2. `useTurnTimer` calculates time elapsed
3. Hook emits `pass-turn` event with time data
4. Server broadcasts `turn-changed` to all clients
5. All clients update UI showing:
   - Previous player's reduced time
   - New current player
   - New countdown starting
6. `TurnTimer` calls `passTurn` mutation (tRPC)
7. Database updated with new state

### Real-time Synchronization

1. **Client-side countdown**: Updates every 100ms for smooth display
2. **Server-side state**: Tracks turn start time and current player
3. **Database persistence**: Stores remaining time after each turn
4. **Multi-client sync**: WebSocket broadcasts ensure all viewers see same state

## Timer Calculation Logic

```typescript
// Current player's remaining time is calculated as:
remainingTime = playerRemainingTimeMs - (currentTime - turnStartedAt)

// When passing turn:
timeUsed = min(elapsedTime, playerRemainingTimeMs)
newRemainingTime = max(0, playerRemainingTimeMs - timeUsed)
```

## Usage Example

### Starting a Game Session with Timer

1. Navigate to active game session page
2. In "Turn-Based Timer" section, click "Enable Timer"
3. Set default time (e.g., 30 minutes)
4. Click "Initialize"
5. Timer starts for first player
6. Players click "Pass Turn" when their turn ends
7. Timer automatically switches to next player
8. Each player's remaining time counts down only during their turn

### Features in Action

- **Real-time updates**: All players see the same timer state
- **Pause/Resume**: Temporarily stop timer (bathroom break, etc.)
- **Time expiry**: Visual indicator when player runs out of time
- **Persistent state**: Timers survive page refreshes (data in database)
- **Multi-device sync**: Same session viewable on multiple devices

## Running the Application

### Development

```bash
npm run dev
```

This starts the custom server with Socket.io on port 3000.

### Production

```bash
npm run build
npm start
```

## File Structure

```
gametracker/
├── server.js                          # Custom Next.js server with Socket.io
├── package.json                       # Updated scripts for custom server
├── prisma/
│   └── schema.prisma                  # Extended with timer fields
├── src/
│   ├── context/
│   │   └── SocketContext.tsx          # WebSocket context provider
│   ├── lib/
│   │   └── hooks/
│   │       └── useTurnTimer.ts        # Turn timer custom hook
│   ├── components/
│   │   ├── TurnTimer.tsx              # Timer UI component
│   │   └── GameSession.tsx            # Updated with TurnTimer
│   ├── pages/
│   │   └── _app.tsx                   # Wrapped with SocketProvider
│   └── server/
│       └── api/
│           └── routers/
│               ├── turntimer.ts       # Turn timer tRPC router
│               └── root.ts            # Updated with turnTimer router
```

## Design Decisions

### Why Socket.io?

- **Bidirectional communication**: Real-time updates from server to all clients
- **Room support**: Easy per-session isolation
- **Fallback support**: Handles connections through firewalls (polling fallback)
- **Battle-tested**: Mature, reliable WebSocket library

### Why Hybrid Architecture (tRPC + Socket.io)?

- **tRPC for CRUD**: Perfect for game session data, player management
- **Socket.io for real-time**: Necessary for timer synchronization
- **Best of both**: Combines type-safety of tRPC with real-time of WebSockets

### Client-side Countdown Calculation

- **Smooth UX**: Updates every 100ms for fluid countdown
- **Reduced server load**: No need to broadcast every tick
- **Sync via events**: Server only broadcasts on state changes (turn pass, pause, etc.)

### Database Persistence

- **Reliability**: Timers survive disconnects and refreshes
- **History**: Can track time usage per player
- **State recovery**: New clients get current state from database

## Limitations and Future Enhancements

### Current Limitations

1. No automatic turn passing when time expires
2. No sound/visual alerts for low time
3. No time increment per turn (chess-style)
4. Timer state recovery after server restart requires database read

### Potential Enhancements

1. **Auto-pass on expire**: Automatically pass turn when time reaches zero
2. **Sound alerts**: Audible warnings at 1 minute, 30 seconds, 10 seconds
3. **Time increments**: Add fixed time after each turn (like chess)
4. **Analytics**: Track average turn time, fastest/slowest players
5. **Customization**: Different time per player, time handicaps
6. **Mobile notifications**: Push notifications for turn changes
7. **Time banks**: Accumulated unused time for emergency use

## Security Considerations

1. **Authentication**: Timer operations should verify user is in game session
2. **Rate limiting**: Prevent rapid pass-turn spam
3. **Validation**: Server validates all time calculations
4. **Authorization**: Only session participants can control timer

## Testing Recommendations

1. **Multi-client testing**: Open session in multiple browsers to verify sync
2. **Network issues**: Test behavior with simulated disconnects
3. **Time boundaries**: Test zero time, negative time edge cases
4. **Concurrent actions**: Multiple users clicking "Pass Turn" simultaneously
5. **Performance**: Test with many active sessions (scaling)

## Conclusion

This turn-based timer system successfully integrates real-time WebSocket communication with the existing Next.js + tRPC + Prisma stack. The architecture is scalable, maintainable, and provides a smooth user experience with real-time synchronization across all connected clients.
