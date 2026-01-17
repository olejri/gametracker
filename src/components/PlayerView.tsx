import type { PlayerNicknameAndScore, GameSessionTeam } from "npm/components/Types";
import Image from "next/image";
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";

export interface PlayerViewRef {
  flushPendingUpdates: () => Promise<void>;
}

const PlayerView = forwardRef<PlayerViewRef, {
  player: PlayerNicknameAndScore,
  updatePlayer: (player: PlayerNicknameAndScore) => void,
  isInReadOnlyMode: boolean
  numberOfPlayers: number
  isRolling?: boolean
  isTeamGame?: boolean
  teams?: GameSessionTeam[]
  gameSessionId?: string
  onDragStart?: (playerId: string) => void
  onDragOver?: (playerId: string) => void
  onDrop?: (targetPlayerId: string) => void
  isDragging?: boolean
  isDragOver?: boolean
}>((props, ref) => {
  const { isInReadOnlyMode, numberOfPlayers, isRolling, isTeamGame, teams, gameSessionId, onDragStart, onDragOver, onDrop, isDragging, isDragOver } = props;
  const [player, setPlayer] = useState<PlayerNicknameAndScore>(props.player);
  const [isUpdatingPos, setIsUpdatingPos] = useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const lastSavedScore = React.useRef(props.player.score);
  const ctx = api.useContext();

  // Sync position when props change (from drag-and-drop or external updates)
  useEffect(() => {
    setPlayer(props.player);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.player.position, props.player.playerId]);

  const mutateScore = api.session.updatePlayerScoreJunction.useMutation({
    onSuccess: () => {
      setIsUpdatingScore(false);
      lastSavedScore.current = player.score;
      void ctx.session.getGameASession.invalidate();
    },
    onMutate: () => {
      setIsUpdatingScore(true);
    }
  });
  const mutatePos = api.session.updatePlayerPosJunction.useMutation({
    onSuccess: () => {
      setIsUpdatingPos(false);
      void ctx.session.getGameASession.invalidate();
    },
    onMutate: () => {
      setIsUpdatingPos(true);
    }
  });
  const updatePlayerTeam = api.session.updatePlayerTeam.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  useEffect(() => {
    if (isInReadOnlyMode || isUpdatingScore) return;
    
    const timeoutId = setTimeout(() => {
      if (player.score !== lastSavedScore.current) {
        mutateScore.mutate(player);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.score, isInReadOnlyMode, isUpdatingScore]);

  useImperativeHandle(ref, () => ({
    flushPendingUpdates: async () => {
      if (!isInReadOnlyMode && player.score !== props.player.score) {
        await mutateScore.mutateAsync(player);
      }
    }
  }));

  // Find the current team for this player
  const currentTeam = teams?.find((t) => t.playerIds.includes(player.playerId));
  const teamBorderColor = isTeamGame && currentTeam ? currentTeam.color : undefined;
  const shouldShowTeamSelector = isTeamGame && teams && teams.length > 0 && !isInReadOnlyMode && gameSessionId;

  return (
    <div
      key={player.playerId}
      draggable={!isInReadOnlyMode && !isInputFocused}
      onDragStart={(e) => {
        if (!isInReadOnlyMode && onDragStart) {
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(player.playerId);
        }
      }}
      onDragOver={(e) => {
        if (!isInReadOnlyMode && onDragOver) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          onDragOver(player.playerId);
        }
      }}
      onDrop={(e) => {
        if (!isInReadOnlyMode && onDrop) {
          e.preventDefault();
          onDrop(player.playerId);
        }
      }}
      onDragEnd={(e) => {
        e.preventDefault();
      }}
      onTouchStart={() => {
        if (!isInReadOnlyMode && onDragStart) {
          onDragStart(player.playerId);
        }
      }}
      onTouchMove={(e) => {
        if (!isInReadOnlyMode && onDragOver) {
          const touch = e.touches[0];
          if (touch) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const playerCard = element?.closest('[data-player-id]');
            if (playerCard) {
              const targetPlayerId = playerCard.getAttribute('data-player-id');
              if (targetPlayerId) {
                onDragOver(targetPlayerId);
              }
            }
          }
        }
      }}
      onTouchEnd={(e) => {
        if (!isInReadOnlyMode && onDrop) {
          const touch = e.changedTouches[0];
          if (touch) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const playerCard = element?.closest('[data-player-id]');
            if (playerCard) {
              const targetPlayerId = playerCard.getAttribute('data-player-id');
              if (targetPlayerId) {
                onDrop(targetPlayerId);
              }
            }
          }
        }
      }}
      data-player-id={player.playerId}
      className={`relative flex items-center space-x-3 rounded-lg bg-white px-6 py-5 shadow-sm hover:border-gray-400 dark:bg-gray-800 dark:hover:border-gray-500 transition-all duration-150 ease-in-out ${isRolling ? 'player-rolling-animation' : ''} ${!teamBorderColor ? 'border border-gray-300 dark:border-gray-600' : ''} ${isDragging ? 'opacity-50 scale-95 cursor-move shadow-lg' : ''} ${isDragOver ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-105' : ''} ${!isInReadOnlyMode && !isInputFocused ? 'cursor-move active:scale-95' : ''}`}
      style={teamBorderColor ? { border: `3px solid ${teamBorderColor}` } : undefined}
    >
      <div className="flex-shrink-0">
        <Image
          width={30}
          height={30}
          key={player.playerId}
          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-900"
          src={player.profileImageUrl}
          alt={player.nickname ?? player.playerId}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`grid grid-flow-row-dense gap-4 ${shouldShowTeamSelector ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{player.nickname}</p>
          <div className="grid grid-cols-1">
            <label className="dark:text-gray-300 text-xs">Score</label>
            {!isUpdatingScore ? <input type="text" id={"score" + player.playerId}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-gray-600"
                   value={player.score}
                   readOnly={isInReadOnlyMode}
                   required
                   onFocus={() => setIsInputFocused(true)}
                   onBlur={() => setIsInputFocused(false)}
                   onChange={(e) => {
                      setPlayer({
                        ...player,
                        score: e.target.value,
                      });
                   }}
            />: <LoadingSpinner />}
          </div>
          <div className="grid grid-cols-1">
            <label className="dark:text-gray-300 text-xs">Position</label>
            {!isUpdatingPos ? (
              <select
                disabled={isInReadOnlyMode}
                id={player.playerId}
                name={"position" + player.playerId}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-gray-600 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  backgroundImage: "none",
                }}
                value={player.position}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => {
                  const newPosition = +e.target.value;
                  setPlayer({
                    ...player,
                    position: newPosition,
                  });
                  if (!isInReadOnlyMode) {
                    mutatePos.mutate({
                      ...player,
                      position: newPosition,
                    });
                  }
                }}
              >
                {Array.from(Array(numberOfPlayers).keys()).map((i) => {
                  if (i !== 0) {
                    return (
                      <option key={i} value={i} className="dark:bg-gray-700 dark:text-white">
                        {i}
                      </option>
                    );
                  }
                })}
              </select>
            ) : (
              <LoadingSpinner />
            )}
          </div>
          {/* Team Selector Dropdown - Only shown when team game mode is active */}
          {shouldShowTeamSelector && (
            <div className="grid grid-cols-1">
              <label className="dark:text-gray-300 text-xs">Team</label>
              {!updatePlayerTeam.isLoading ? (
                <select
                  value={currentTeam?.id ?? teams[0]?.id ?? ""}
                  onChange={(e) => {
                    if (e.target.value && gameSessionId) {
                      updatePlayerTeam.mutate({
                        gameSessionId: gameSessionId,
                        playerId: player.playerId,
                        teamId: e.target.value
                      });
                    }
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-gray-600 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                    backgroundImage: "none",
                  }}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <LoadingSpinner />
              )}
            </div>
          )}
        </div>
      </div>
      <div>
      </div>
    </div>
  );
});

PlayerView.displayName = 'PlayerView';

export default PlayerView;