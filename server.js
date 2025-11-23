const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory store for active game sessions
const activeSessions = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  });

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a game session room
    socket.on('join-session', (sessionId) => {
      console.log(`Socket ${socket.id} joining session ${sessionId}`);
      socket.join(sessionId);
      
      // Send current session state if it exists
      const sessionState = activeSessions.get(sessionId);
      if (sessionState) {
        socket.emit('session-state', sessionState);
      }
    });

    // Leave a game session room
    socket.on('leave-session', (sessionId) => {
      console.log(`Socket ${socket.id} leaving session ${sessionId}`);
      socket.leave(sessionId);
    });

    // Start turn-based timer for a session
    socket.on('start-timer', (data) => {
      const { sessionId, playerId, remainingTimeMs } = data;
      console.log(`Starting timer for session ${sessionId}, player ${playerId}`);
      
      const sessionState = {
        sessionId,
        currentPlayerId: playerId,
        turnStartedAt: Date.now(),
        remainingTimeMs,
        isActive: true
      };
      
      activeSessions.set(sessionId, sessionState);
      
      // Broadcast to all clients in the session room
      io.to(sessionId).emit('timer-started', sessionState);
    });

    // Pass turn to next player
    socket.on('pass-turn', (data) => {
      const { sessionId, currentPlayerId, nextPlayerId, timeUsed, remainingTimeMs } = data;
      console.log(`Passing turn in session ${sessionId} from ${currentPlayerId} to ${nextPlayerId}`);
      
      const sessionState = activeSessions.get(sessionId);
      if (sessionState) {
        sessionState.currentPlayerId = nextPlayerId;
        sessionState.turnStartedAt = Date.now();
        sessionState.remainingTimeMs = remainingTimeMs;
        
        activeSessions.set(sessionId, sessionState);
        
        // Broadcast turn change to all clients in the session
        io.to(sessionId).emit('turn-changed', {
          previousPlayerId: currentPlayerId,
          currentPlayerId: nextPlayerId,
          timeUsed,
          remainingTimeMs,
          turnStartedAt: sessionState.turnStartedAt
        });
      }
    });

    // Pause timer
    socket.on('pause-timer', (data) => {
      const { sessionId } = data;
      console.log(`Pausing timer for session ${sessionId}`);
      
      const sessionState = activeSessions.get(sessionId);
      if (sessionState) {
        sessionState.isActive = false;
        activeSessions.set(sessionId, sessionState);
        
        io.to(sessionId).emit('timer-paused', { sessionId });
      }
    });

    // Resume timer
    socket.on('resume-timer', (data) => {
      const { sessionId, remainingTimeMs } = data;
      console.log(`Resuming timer for session ${sessionId}`);
      
      const sessionState = activeSessions.get(sessionId);
      if (sessionState) {
        sessionState.isActive = true;
        sessionState.turnStartedAt = Date.now();
        sessionState.remainingTimeMs = remainingTimeMs;
        activeSessions.set(sessionId, sessionState);
        
        io.to(sessionId).emit('timer-resumed', { sessionId, turnStartedAt: sessionState.turnStartedAt, remainingTimeMs });
      }
    });

    // End session timer
    socket.on('end-timer', (data) => {
      const { sessionId } = data;
      console.log(`Ending timer for session ${sessionId}`);
      
      activeSessions.delete(sessionId);
      io.to(sessionId).emit('timer-ended', { sessionId });
    });

    // Player time expired
    socket.on('time-expired', (data) => {
      const { sessionId, playerId } = data;
      console.log(`Time expired for player ${playerId} in session ${sessionId}`);
      
      io.to(sessionId).emit('player-time-expired', { sessionId, playerId });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.IO server initialized');
    });
});
