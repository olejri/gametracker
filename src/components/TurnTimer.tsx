import React, { useState, useEffect } from 'react';
import { useTurnTimer } from 'npm/lib/hooks/useTurnTimer';
import { api } from 'npm/utils/api';
import { ClockIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';

interface TurnTimerProps {
  sessionId: string;
  enabled: boolean;
  onToggle?: (enabled: boolean) => void;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const TurnTimer: React.FC<TurnTimerProps> = ({
  sessionId,
  enabled,
  onToggle
}) => {
  const ctx = api.useContext();
  
  // Fetch timer state from the server
  const { data: timerState, isLoading } = api.turnTimer.getTimerState.useQuery(
    { sessionId },
    { enabled: enabled, refetchInterval: false }
  );

  const initializeTurnTimer = api.turnTimer.initializeTurnTimer.useMutation({
    onSuccess: () => {
      void ctx.turnTimer.getTimerState.invalidate({ sessionId });
      void ctx.session.getGameASession.invalidate();
    }
  });

  const passTurnMutation = api.turnTimer.passTurn.useMutation({
    onSuccess: () => {
      void ctx.turnTimer.getTimerState.invalidate({ sessionId });
      void ctx.session.getGameASession.invalidate();
    }
  });

  const disableTurnTimer = api.turnTimer.disableTurnTimer.useMutation({
    onSuccess: () => {
      void ctx.turnTimer.getTimerState.invalidate({ sessionId });
      void ctx.session.getGameASession.invalidate();
      if (onToggle) onToggle(false);
    }
  });

  const updatePlayerTime = api.turnTimer.updatePlayerTime.useMutation();

  const [showInitDialog, setShowInitDialog] = useState(false);
  const [defaultTimeMinutes, setDefaultTimeMinutes] = useState(30);

  // Initialize useTurnTimer hook
  const {
    currentPlayerId,
    players,
    isActive,
    currentPlayerRemainingTime,
    startTimer,
    passTurn,
    pauseTimer,
    resumeTimer,
    endTimer
  } = useTurnTimer({
    sessionId,
    initialPlayers: timerState?.players ?? [],
    initialCurrentPlayerId: timerState?.currentTurnPlayerId,
    initialTurnStartedAt: timerState?.turnStartedAt,
    enabled: enabled && !!timerState?.turnBasedTimerEnabled
  });

  // Check if time has expired for current player
  useEffect(() => {
    if (isActive && currentPlayerRemainingTime <= 0 && currentPlayerId) {
      // Time expired - could trigger an alert or auto-pass turn
      console.log('Time expired for player:', currentPlayerId);
    }
  }, [isActive, currentPlayerRemainingTime, currentPlayerId]);

  const handleInitialize = () => {
    if (!timerState || timerState.players.length < 2) {
      alert('Need at least 2 players to start turn timer');
      return;
    }

    const playerIds = timerState.players.map(p => p.playerId);
    const defaultTimeMs = defaultTimeMinutes * 60 * 1000;

    initializeTurnTimer.mutate({
      sessionId,
      defaultPlayerTimeMs: defaultTimeMs,
      playerIds
    });

    setShowInitDialog(false);
  };

  const handlePassTurn = () => {
    if (!currentPlayerId || players.length < 2) return;

    const currentPlayerIndex = players.findIndex(p => p.playerId === currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];

    if (!nextPlayer) return;

    const currentPlayer = players.find(p => p.playerId === currentPlayerId);
    if (!currentPlayer) return;

    const elapsedMs = currentPlayer.remainingTimeMs - currentPlayerRemainingTime;

    passTurn(nextPlayer.playerId, (timeUsed, newRemainingTime) => {
      // Update player time in database
      updatePlayerTime.mutate({
        junctionId: currentPlayer.junctionId,
        remainingTimeMs: newRemainingTime
      });

      // Pass turn mutation to update server state
      passTurnMutation.mutate({
        sessionId,
        currentPlayerId,
        nextPlayerId: nextPlayer.playerId,
        timeUsedMs: timeUsed
      });
    });
  };

  const handleDisable = () => {
    endTimer();
    disableTurnTimer.mutate({ sessionId });
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading timer...</div>;
  }

  if (!enabled || !timerState?.turnBasedTimerEnabled) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Turn-based timer not enabled
            </span>
          </div>
          <button
            onClick={() => setShowInitDialog(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Enable Timer
          </button>
        </div>

        {showInitDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold">Initialize Turn Timer</h3>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Default time per player (minutes):
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={defaultTimeMinutes}
                  onChange={(e) => setDefaultTimeMinutes(parseInt(e.target.value) || 30)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowInitDialog(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitialize}
                  disabled={initializeTurnTimer.isLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {initializeTurnTimer.isLoading ? 'Initializing...' : 'Initialize'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentPlayer = players.find(p => p.playerId === currentPlayerId);
  const isTimeExpired = currentPlayerRemainingTime <= 0;

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">Turn Timer</span>
        </div>
        <button
          onClick={handleDisable}
          className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Disable Timer
        </button>
      </div>

      {/* Current Player Timer */}
      {currentPlayer && (
        <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Turn: {currentPlayer.playerName}
          </div>
          <div
            className={`text-3xl font-bold ${
              isTimeExpired
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {formatTime(currentPlayerRemainingTime)}
          </div>
          {isTimeExpired && (
            <div className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              Time Expired!
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="mb-4 flex gap-2">
        {!isActive && currentPlayerId && (
          <button
            onClick={() => startTimer(currentPlayerId)}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <PlayIcon className="h-4 w-4" />
            Start
          </button>
        )}
        {isActive && (
          <button
            onClick={pauseTimer}
            className="flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <PauseIcon className="h-4 w-4" />
            Pause
          </button>
        )}
        {!isActive && currentPlayerId && players.length > 0 && (
          <button
            onClick={resumeTimer}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <PlayIcon className="h-4 w-4" />
            Resume
          </button>
        )}
        <button
          onClick={handlePassTurn}
          disabled={!isActive || !currentPlayerId}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Pass Turn →
        </button>
      </div>

      {/* Player List */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          All Players:
        </div>
        {players.map((player) => (
          <div
            key={player.playerId}
            className={`flex items-center justify-between rounded-md p-2 ${
              player.playerId === currentPlayerId
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <span className="text-sm font-medium">{player.playerName}</span>
            <span
              className={`text-sm ${
                player.remainingTimeMs <= 0
                  ? 'font-bold text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {formatTime(player.remainingTimeMs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
