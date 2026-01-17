import { type GameSessionProps, GameSessionStatus, type PlayerNicknameAndScore } from "npm/components/Types";
import { sortPlayers } from "npm/components/HelperFunctions";
import { api } from "npm/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { useEffect, useState, useRef, createRef } from "react";
import PlayerView, { type PlayerViewRef } from "npm/components/PlayerView";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { Button } from "npm/components/ui";
import { StatusBadge } from "npm/components/ui";
import { formatDate, transformDate } from "npm/lib/utils";

// Predefined team colors for adding new teams
const TEAM_COLORS = [
  { name: "Green", color: "#22C55E" },
  { name: "Yellow", color: "#EAB308" },
  { name: "Purple", color: "#A855F7" },
  { name: "Orange", color: "#F97316" },
  { name: "Pink", color: "#EC4899" },
  { name: "Cyan", color: "#06B6D4" },
];

const GameSession = (props: GameSessionProps) => {
  const {
    data: game,
    isError,
    isLoading: sessionIsLoading,
    error
  } = api.session.getGameASession.useQuery({ data: { id: props.gameId } });
  const { data: userRole } = api.group.getActiveGameGroup.useQuery();
  const ctx = api.useContext();
  const [haveError, setHaveError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const path = useRouter();
  const [seatAssignments, setSeatAssignments] = useState<Record<string, number> | null>(null);
  const [startingPlayer, setStartingPlayer] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [rollingPlayerIndex, setRollingPlayerIndex] = useState<number | null>(null);
  const [animationOnGoing, setAnimationOnGoing] = useState<boolean | null>(null);
  const [isTeamTogglePending, setIsTeamTogglePending] = useState(false);
  const [prevTeamGameValue, setPrevTeamGameValue] = useState<boolean | null>(null);
  const playerViewRefs = useRef<Record<string, React.RefObject<PlayerViewRef>>>({});
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);

  const updateGameSession = api.session.updateGameSession.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
      void ctx.session.getGameASession.invalidate();
    },
    onMutate: () => {
      setHaveError(false);
      // setIsUpdating(true);
    }
  });

  const updateDescription = api.session.updateGameSessionDescription.useMutation({
    onSuccess: (description) => {
      void ctx.session.getGameASession.invalidate();
      setDescription(description);
    }
  });

  const updateDate = api.session.updateGameSessionDate.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    },
    onError: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  const finishGameSession = api.session.finishGameSession.useMutation({
    onSuccess: () => {
      setHaveError(false);
      void ctx.session.getGameASession.invalidate();
    },
    onError: () => {
      setHaveError(true);
    }
  });

  const deleteGameSession = api.session.deleteAGameSession.useMutation({
    onSuccess: () => {
      setHaveError(false);
      void path.push("/[dashboardId]/dashboard", `/${props.groupName}/dashboard`);
    },
    onError: () => {
      setIsUpdating(false);
      setHaveError(true);
    },
    onMutate: () => {
      setIsUpdating(true);
    }
  });

  const rollSeats = api.session.rollSeats.useMutation({
    onSuccess: (data) => {
      setSeatAssignments(data.seatAssignments);
      void ctx.session.getRandomizationHistory.invalidate();
    }
  });

  const rollStartingPlayer = api.session.rollStartingPlayer.useMutation({
    onSuccess: (data) => {
      setStartingPlayer(data.startingPlayer);
      void ctx.session.getRandomizationHistory.invalidate();
    }
  });

  const toggleTeamGame = api.session.toggleTeamGame.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  const addTeam = api.session.addTeam.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  const removeTeam = api.session.removeTeam.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  const updatePlayerPosition = api.session.updatePlayerPosJunction.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  const unlockGameSession = api.session.unlockGameSession.useMutation({
    onSuccess: () => {
      void ctx.session.getGameASession.invalidate();
    }
  });

  const startRollingAnimation = () => {
    if(!game) return;
    const sortedPlayers = sortPlayers(game.players);
    const numPlayers = sortedPlayers.length;
    
    // Animation schedule: start fast, slow down in last 3 seconds
    // Total duration: 10 seconds
    const intervals: number[] = [];
    let currentTime = 0;
    
    // First 7 seconds: fast cycling (100ms intervals)
    while (currentTime < 5000) {
      intervals.push(300);
      currentTime += 300;
    }
    
    // Last 3 seconds: slow down to 1 second intervals
    intervals.push(400); // 7s -> 8s
    intervals.push(600); // 8s -> 9s
    intervals.push(800); // 9s -> 10s
    
    let currentIndex = 0;
    let intervalIndex = 0;
    let targetIndex: number | null = null;
    let backendFetched = false;
    
    // Fetch the starting player from backend after 9 seconds
    setTimeout(() => {
      rollStartingPlayer.mutate(
        { gameSessionId: game.sessionId },
        {
          onSuccess: (data) => {
            // Find the target player index
            const foundIndex = sortedPlayers.findIndex(
              (player) => player.nickname === data.startingPlayer
            );
            targetIndex = foundIndex >= 0 ? foundIndex : null;
            backendFetched = true;
          }
        }
      );
    }, 3000);
    
    const animate = () => {
      console.log(`Animating index: ${currentIndex}, intervalIndex: ${intervalIndex}`);
      if (intervalIndex >= intervals.length) {
        // Animation complete - hold on final player for 2 seconds then clear
        setTimeout(() => {
          setRollingPlayerIndex(null);
        }, 2000);
        return;
      }

      // For the last few steps, if we have the target, land on it
      const stepsRemaining = intervals.length - intervalIndex;
      if (backendFetched && targetIndex !== null && stepsRemaining <= 3) {
        // Calculate exactly where we need to be to land on target
        currentIndex = (targetIndex - stepsRemaining + 1 + numPlayers * 100) % numPlayers;
        if(stepsRemaining === 1){
          setAnimationOnGoing(false)
          setTimeout(() => {
            setRollingPlayerIndex(null);
          }, 3000);
        }
      }
      
      setRollingPlayerIndex(currentIndex);
      
      // Normal increment when not in landing phase
      if (!backendFetched || targetIndex === null || stepsRemaining > 3) {
        currentIndex = (currentIndex + 1) % numPlayers;
      }
      
      intervalIndex++;
      
      if (intervalIndex < intervals.length) {
        setTimeout(animate, intervals[intervalIndex]);
      }
    };
    
    // Start animation immediately
    setAnimationOnGoing(true)
    animate();
  };

  const { data: randomizationHistory } = api.session.getRandomizationHistory.useQuery(
    { gameSessionId: game?.sessionId ?? "" },
    { enabled: !!game?.sessionId }
  );

  const handleDragStart = (playerId: string) => {
    setDraggedPlayerId(playerId);
  };

  const handleDragOver = (playerId: string) => {
    setDragOverPlayerId(playerId);
  };

  const handleDrop = (targetPlayerId: string) => {
    if (!draggedPlayerId || draggedPlayerId === targetPlayerId || !game) {
      setDraggedPlayerId(null);
      setDragOverPlayerId(null);
      return;
    }

    const draggedPlayer = game.players.find(p => p.playerId === draggedPlayerId);
    const targetPlayer = game.players.find(p => p.playerId === targetPlayerId);

    if (draggedPlayer && targetPlayer) {
      // Swap positions
      const draggedPos = draggedPlayer.position;
      const targetPos = targetPlayer.position;

      // Optimistically update the UI immediately
      ctx.session.getGameASession.setData(
        { data: { id: game.sessionId } },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            players: oldData.players.map((p) => {
              if (p.playerId === draggedPlayerId) {
                return { ...p, position: targetPos };
              }
              if (p.playerId === targetPlayerId) {
                return { ...p, position: draggedPos };
              }
              return p;
            }),
          };
        }
      );

      // Update server in background
      updatePlayerPosition.mutate({
        junctionId: draggedPlayer.junctionId,
        position: targetPos
      });

      updatePlayerPosition.mutate({
        junctionId: targetPlayer.junctionId,
        position: draggedPos
      });
    }

    setDraggedPlayerId(null);
    setDragOverPlayerId(null);
  };

  const [description, setDescription] = useState<string>(game?.description ?? "");
  const [dateText, setDateText] = useState<string>("");

  useEffect(() => {
    setDateText(formatDate(game?.createdAt) ?? "");
  }, [game?.createdAt]);

  useEffect(() => {
    setDescription(game?.description ?? "");
  }, [game?.description]);

  useEffect(() => {
    if (!isTeamTogglePending) return;
    if (prevTeamGameValue === null) return;
    if (!game) return;

    // When game.isTeamGame changes from the previous value → update done
    if (game.isTeamGame !== prevTeamGameValue) {
      setIsTeamTogglePending(false);
      setPrevTeamGameValue(null);
    }
  }, [game?.isTeamGame, isTeamTogglePending, prevTeamGameValue, game]);


  if (sessionIsLoading || isUpdating) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }
  if (isError) {
    return <div className="text-center mt-4 text-gray-900 dark:text-white">{error?.message}</div>;
  }

  const isInReadOnlyMode = game.status === "Completed" || game.status === "Cancelled";

  const updatePlayer = (updatedPlayer: PlayerNicknameAndScore) => {
    updateGameSession.mutate({
      gameSessionId: game.sessionId,
      status: game.status,
      players: game.players.map((player) => {
        if (player.playerId === updatedPlayer.playerId) {
          return {
            ...updatedPlayer
          };
        }
        return player;
      })
    });
  };
  return (
    <div className="container mx-auto sm:px-6 lg:px-8">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800">
        <div className="grid grid-cols-2">
          <div className="px-4 py-5 sm:p-6">
            <Image src={game.image_url} alt="My Image" width={300} height={300} className="rounded-lg mt-4" />
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge color="green">
                {game.status}
              </StatusBadge>
              {/* Unlock button for admins when game is Completed */}
              {game.status === "Completed" && userRole?.role === "ADMIN" && (
                unlockGameSession.isLoading ? (
                  <LoadingSpinner size={20} />
                ) : (
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to unlock this game session? It will change the status from Completed to Ongoing so you can edit it.")) {
                        unlockGameSession.mutate({
                          gameSessionId: game.sessionId,
                          groupId: props.groupName
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                    title="Unlock to edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Unlock
                  </button>
                )
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="isolate -space-y-px rounded-md shadow-sm">
                <div
                  className="relative rounded-md rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600 dark:ring-gray-600">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-900 dark:text-white">
                    Game Name
                  </label>
                  <input
                    type="text"
                    readOnly={true}
                    value={game.gameName}
                    name="name"
                    id="name"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                    placeholder="Game Name"
                  />
                </div>
                <div
                  className="relative rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600 dark:ring-gray-600">
                  <label htmlFor="description" className="block text-xs font-medium text-gray-900 dark:text-white">
                    Description
                  </label>
                  {!updateDescription.isLoading  ? <input
                    onBlur={(e) => {
                      if(isInReadOnlyMode) return;
                      updateDescription.mutate({
                        gameSessionId: game.sessionId,
                        description: e.target.value
                      });
                    }}
                    onChange={(e) => {
                      setDescription(e.target.value);}
                    }
                    type="text"
                    readOnly={isInReadOnlyMode}
                    value={description}
                    name="description"
                    id="description"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  />: <LoadingSpinner size={30} />}
                </div>
                {game.expansions.length > 0 && <div
                  className="relative rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600 dark:ring-gray-600">
                  <label htmlFor="expansion" className="block text-xs font-medium text-gray-900 dark:text-white">
                    Expansions
                  </label>
                  <div
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  >
                    {game.expansions.map((expansion) => (
                      <span
                        key={expansion.gameId}
                        className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {expansion.gameName}
                </span>))}
                  </div>
                </div>}
                <div
                  className="relative rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600 dark:ring-gray-600">
                  <label htmlFor="date" className="block text-xs font-medium text-gray-900 dark:text-white">
                    Date
                  </label>
                  {!updateDate.isLoading ?
                    <input
                      onBlur={() => {
                        if(isInReadOnlyMode) return;
                        const newDateText = transformDate(dateText);
                        const date = dayjs(newDateText).toDate();
                        updateDate.mutate({
                          gameSessionId: game.sessionId,
                          date: date
                        });
                      }}
                      onChange={(event) => {
                        setDateText(event.target.value)
                      }}
                      type="text"
                      readOnly={isInReadOnlyMode}
                      value={dateText}
                      name="date"
                      id="date"
                      className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                    />: <LoadingSpinner size={30} />}
                </div>
                {/* Team Game Mode Toggle - Only shown for Ongoing games */}
                {game.status === GameSessionStatus.Ongoing && (
                  <div
                    className="relative rounded-b-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600 dark:ring-gray-600">
                    <label htmlFor="teamGame" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Team Game
                    </label>

                    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {game.isTeamGame ? "Enabled" : "Disabled"}
      </span>

                      {isTeamTogglePending || toggleTeamGame.isLoading ? (
                        <LoadingSpinner size={24} />
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={game.isTeamGame}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              // Start pending state
                              setPrevTeamGameValue(game.isTeamGame);
                              setIsTeamTogglePending(true);

                              toggleTeamGame.mutate({
                                gameSessionId: game.sessionId,
                                isTeamGame: checked,
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team Management Section - Only shown when Team Game Mode is enabled */}
      {game.status === GameSessionStatus.Ongoing && game.isTeamGame && (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800 mt-4">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Teams
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {game.teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ 
                    backgroundColor: team.color + '20',
                    border: `2px solid ${team.color}`
                  }}
                >
                  <span 
                    className="font-medium text-sm"
                    style={{ color: team.color }}
                  >
                    {team.name} Team
                  </span>
                  {game.teams.length > 2 && (
                    <button
                      onClick={() => removeTeam.mutate({ teamId: team.id })}
                      className="text-gray-500 hover:text-red-500 text-xs ml-1"
                      disabled={removeTeam.isLoading}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add Team Button */}
              {game.teams.length < game.players.length && (
                <>
                  {TEAM_COLORS.filter(tc => 
                    !game.teams.some(t => t.name === tc.name)
                  ).slice(0, 1).map((teamColor) => (
                    <Button
                      key={teamColor.name}
                      variant="primary"
                      onClick={() => addTeam.mutate({
                        gameSessionId: game.sessionId,
                        name: teamColor.name,
                        color: teamColor.color
                      })}
                      disabled={addTeam.isLoading}
                    >
                      + Add Team
                    </Button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800 mt-4">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortPlayers(game.players).map((player, index) => {
              if (!playerViewRefs.current[player.playerId]) {
                playerViewRefs.current[player.playerId] = createRef<PlayerViewRef>();
              }
              return (
                <PlayerView
                  key={player.playerId}
                  ref={playerViewRefs.current[player.playerId]}
                  player={player}
                  updatePlayer={updatePlayer}
                  isInReadOnlyMode={isInReadOnlyMode}
                  numberOfPlayers={game.players.length + 1}
                  isRolling={rollingPlayerIndex === index}
                  isTeamGame={game.isTeamGame}
                  teams={game.teams}
                  gameSessionId={game.sessionId}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedPlayerId === player.playerId}
                  isDragOver={dragOverPlayerId === player.playerId}
                />
              );
            })}
          </div>
        </div>
      </div>
      {game.status === GameSessionStatus.Ongoing ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800 mt-4">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Randomization Tools
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="primary"
                onClick={() => {
                  rollSeats.mutate({ gameSessionId: game.sessionId });
                }}
                disabled={rollSeats.isLoading}
              >
                {rollSeats.isLoading ? "Rolling..." : "Roll Seats"}
              </Button>
              <Button
                variant="primary"
                onClick={startRollingAnimation}
                disabled={rollStartingPlayer.isLoading}
              >
                {animationOnGoing ? "Rolling..." : "Roll Starting Player"}
              </Button>
              {randomizationHistory && randomizationHistory.length > 0 && (
                <Button
                  variant="primary"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? "Hide History" : "Show History"}
                </Button>
              )}
            </div>
            
            {seatAssignments && (
              <div className="mb-4 p-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-green-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-black dark:text-green-300 mb-2">
                  Seat Assignments:
                </h4>
                <div className="text-sm text-black dark:text-green-200">
                  {Object.entries(seatAssignments).map(([player, seat]) => (
                    <div key={player} className="mb-1">
                      <span className="font-medium">{player}:</span> Seat {seat}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {startingPlayer && !animationOnGoing &&(
              <div className="mb-4 p-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-black dark:text-blue-300 mb-2">
                  Starting Player:
                </h4>
                <div className="text-sm text-black dark:text-blue-200 font-medium">
                  {startingPlayer}
                </div>
              </div>
            )}

            {showHistory && randomizationHistory && randomizationHistory.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">
                  Randomization History
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {randomizationHistory.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {log.type === "seat_order" ? "Seat Order" : "Starting Player"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {dayjs(log.createdAt).format("MMM D, YYYY h:mm A")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {log.type === "seat_order" ? (
                          Object.entries(log.data as Record<string, number>).map(([player, seat]) => (
                            <div key={player} className="mb-1">
                              {player}: Seat {seat}
                            </div>
                          ))
                        ) : (
                          <div>Starting player: {(log.data as { startingPlayer: string }).startingPlayer}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {game.status === GameSessionStatus.Ongoing ? <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800 mt-4">
        <div className="px-4 py-5 sm:p-6">
          <div className="gap-2">
            <Button
              variant="primary"
              onClick={() => {
                void (async () => {
                  setHaveError(false);
                  // Flush all pending score updates before finishing
                  const flushPromises = Object.values(playerViewRefs.current)
                    .map(ref => ref.current?.flushPendingUpdates())
                    .filter(Boolean);
                  await Promise.all(flushPromises);
                  
                  finishGameSession.mutate({
                    sessionId: game.sessionId,
                    players: game.players.map((player) => {
                      return {
                        playerId: player.playerId,
                        score: player.score,
                        position: player.position
                      };
                    })
                  });
                })();
              }}>
              Finish session
            </Button>
            <Button
              variant="danger"
              disabled={isInReadOnlyMode}
              onClick={() => {
                setHaveError(false);
                deleteGameSession.mutate({ sessionId: game.sessionId })
              }}
            >
              Delete session
            </Button>
          </div>
          {haveError ? <div className="text-center mt-4 text-red-600 dark:text-red-400">Error while finish or deleting the session</div> : <></>}
        </div>
      </div> : <> </>}
    </div>
  );
};
export default GameSession;
