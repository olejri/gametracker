import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from 'npm/context/SocketContext';

interface PlayerTimer {
  playerId: string;
  playerName: string;
  remainingTimeMs: number;
  junctionId: string;
}

interface UseTurnTimerProps {
  sessionId: string;
  initialPlayers: PlayerTimer[];
  initialCurrentPlayerId?: string | null;
  initialTurnStartedAt?: Date | null;
  enabled: boolean;
}

interface TurnTimerState {
  currentPlayerId: string | null;
  players: Map<string, PlayerTimer>;
  turnStartedAt: number | null;
  isActive: boolean;
}

export const useTurnTimer = ({
  sessionId,
  initialPlayers,
  initialCurrentPlayerId,
  initialTurnStartedAt,
  enabled
}: UseTurnTimerProps) => {
  const { socket, isConnected } = useSocket();
  const [timerState, setTimerState] = useState<TurnTimerState>({
    currentPlayerId: initialCurrentPlayerId ?? null,
    players: new Map(initialPlayers.map(p => [p.playerId, p])),
    turnStartedAt: initialTurnStartedAt ? new Date(initialTurnStartedAt).getTime() : null,
    isActive: enabled && !!initialCurrentPlayerId
  });
  
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every 100ms for smooth countdown
  useEffect(() => {
    if (timerState.isActive) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isActive]);

  // Join session room when socket connects
  useEffect(() => {
    if (socket && isConnected && enabled) {
      socket.emit('join-session', sessionId);

      return () => {
        socket.emit('leave-session', sessionId);
      };
    }
  }, [socket, isConnected, sessionId, enabled]);

  // Listen for timer events
  useEffect(() => {
    if (!socket || !enabled) return;

    const handleTimerStarted = (data: {
      sessionId: string;
      currentPlayerId: string;
      turnStartedAt: number;
      remainingTimeMs: number;
      isActive: boolean;
    }) => {
      setTimerState(prev => ({
        ...prev,
        currentPlayerId: data.currentPlayerId,
        turnStartedAt: data.turnStartedAt,
        isActive: data.isActive
      }));
    };

    const handleTurnChanged = (data: {
      previousPlayerId: string;
      currentPlayerId: string;
      timeUsed: number;
      remainingTimeMs: number;
      turnStartedAt: number;
    }) => {
      setTimerState(prev => {
        const newPlayers = new Map(prev.players);
        const prevPlayer = newPlayers.get(data.previousPlayerId);
        if (prevPlayer) {
          newPlayers.set(data.previousPlayerId, {
            ...prevPlayer,
            remainingTimeMs: data.remainingTimeMs
          });
        }
        
        return {
          ...prev,
          currentPlayerId: data.currentPlayerId,
          players: newPlayers,
          turnStartedAt: data.turnStartedAt,
          isActive: true
        };
      });
    };

    const handleTimerPaused = () => {
      setTimerState(prev => ({ ...prev, isActive: false }));
    };

    const handleTimerResumed = (data: { turnStartedAt: number; remainingTimeMs: number }) => {
      setTimerState(prev => ({ ...prev, isActive: true, turnStartedAt: data.turnStartedAt }));
    };

    const handleTimerEnded = () => {
      setTimerState(prev => ({ ...prev, isActive: false, currentPlayerId: null }));
    };

    const handlePlayerTimeExpired = (data: { playerId: string }) => {
      setTimerState(prev => {
        const newPlayers = new Map(prev.players);
        const player = newPlayers.get(data.playerId);
        if (player) {
          newPlayers.set(data.playerId, { ...player, remainingTimeMs: 0 });
        }
        return { ...prev, players: newPlayers };
      });
    };

    socket.on('timer-started', handleTimerStarted);
    socket.on('turn-changed', handleTurnChanged);
    socket.on('timer-paused', handleTimerPaused);
    socket.on('timer-resumed', handleTimerResumed);
    socket.on('timer-ended', handleTimerEnded);
    socket.on('player-time-expired', handlePlayerTimeExpired);

    return () => {
      socket.off('timer-started', handleTimerStarted);
      socket.off('turn-changed', handleTurnChanged);
      socket.off('timer-paused', handleTimerPaused);
      socket.off('timer-resumed', handleTimerResumed);
      socket.off('timer-ended', handleTimerEnded);
      socket.off('player-time-expired', handlePlayerTimeExpired);
    };
  }, [socket, enabled]);

  // Calculate current player's remaining time
  const getCurrentPlayerRemainingTime = useCallback(() => {
    if (!timerState.currentPlayerId) {
      return 0;
    }
    
    if (!timerState.turnStartedAt || !timerState.isActive) {
      const currentPlayer = timerState.players.get(timerState.currentPlayerId);
      return currentPlayer?.remainingTimeMs ?? 0;
    }

    const currentPlayer = timerState.players.get(timerState.currentPlayerId);
    if (!currentPlayer) return 0;

    const elapsedMs = currentTime - timerState.turnStartedAt;
    const remaining = Math.max(0, currentPlayer.remainingTimeMs - elapsedMs);
    
    return remaining;
  }, [timerState, currentTime]);

  // Start timer for a player
  const startTimer = useCallback((playerId: string) => {
    if (!socket) return;
    
    const player = timerState.players.get(playerId);
    if (!player) return;

    socket.emit('start-timer', {
      sessionId,
      playerId,
      remainingTimeMs: player.remainingTimeMs
    });
  }, [socket, sessionId, timerState.players]);

  // Pass turn to next player
  const passTurn = useCallback((nextPlayerId: string, onSuccess?: (timeUsed: number, newRemainingTime: number) => void) => {
    if (!socket || !timerState.currentPlayerId || !timerState.turnStartedAt) return;

    const currentPlayer = timerState.players.get(timerState.currentPlayerId);
    if (!currentPlayer) return;

    const elapsedMs = Date.now() - timerState.turnStartedAt;
    const timeUsed = Math.min(elapsedMs, currentPlayer.remainingTimeMs);
    const newRemainingTime = Math.max(0, currentPlayer.remainingTimeMs - timeUsed);

    socket.emit('pass-turn', {
      sessionId,
      currentPlayerId: timerState.currentPlayerId,
      nextPlayerId,
      timeUsed,
      remainingTimeMs: newRemainingTime
    });

    if (onSuccess) {
      onSuccess(timeUsed, newRemainingTime);
    }
  }, [socket, sessionId, timerState]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!socket) return;
    socket.emit('pause-timer', { sessionId });
  }, [socket, sessionId]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (!socket || !timerState.currentPlayerId) return;
    
    const currentPlayer = timerState.players.get(timerState.currentPlayerId);
    if (!currentPlayer) return;

    socket.emit('resume-timer', {
      sessionId,
      remainingTimeMs: getCurrentPlayerRemainingTime()
    });
  }, [socket, sessionId, timerState, getCurrentPlayerRemainingTime]);

  // End timer
  const endTimer = useCallback(() => {
    if (!socket) return;
    socket.emit('end-timer', { sessionId });
  }, [socket, sessionId]);

  return {
    currentPlayerId: timerState.currentPlayerId,
    players: Array.from(timerState.players.values()),
    isActive: timerState.isActive,
    currentPlayerRemainingTime: getCurrentPlayerRemainingTime(),
    startTimer,
    passTurn,
    pauseTimer,
    resumeTimer,
    endTimer
  };
};
