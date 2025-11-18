import { type GameSessionProps, GameSessionStatus, type PlayerNicknameAndScore } from "npm/components/Types";
import { sortPlayers } from "npm/components/HelperFunctions";
import { api } from "npm/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { useEffect, useState } from "react";
import PlayerView from "npm/components/PlayerView";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { Button } from "npm/components/ui";
import { StatusBadge } from "npm/components/ui";
import { formatDate, transformDate } from "npm/lib/utils";

const GameSession = (props: GameSessionProps) => {
  const {
    data: game,
    isError,
    isLoading: sessionIsLoading,
    error
  } = api.session.getGameASession.useQuery({ data: { id: props.gameId } });
  const ctx = api.useContext();
  const [haveError, setHaveError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const path = useRouter();
  const [seatAssignments, setSeatAssignments] = useState<Record<string, number> | null>(null);
  const [startingPlayer, setStartingPlayer] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [rollingPlayerIndex, setRollingPlayerIndex] = useState<number | null>(null);

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
      // Stop the animation after it completes
      setTimeout(() => {
        setRollingPlayerIndex(null);
      }, 3000);
    }
  });

  const startRollingAnimation = (numPlayers: number) => {
    // Animation schedule: start fast, slow down in last 3 seconds
    // Total duration: 10 seconds
    const intervals: number[] = [];
    let currentTime = 0;
    
    // First 7 seconds: fast cycling (100ms intervals)
    while (currentTime < 2000) {
      intervals.push(300);
      currentTime += 300;
    }
    
    // Last 3 seconds: slow down to 1 second intervals
    intervals.push(500); // 7s -> 8s
    intervals.push(700); // 8s -> 9s
    intervals.push(1000); // 9s -> 10s
    
    let currentIndex = 0;
    let intervalIndex = 0;
    
    const animate = () => {
      if (intervalIndex >= intervals.length) {
        return;
      }
      
      setRollingPlayerIndex(currentIndex);
      currentIndex = (currentIndex + 1) % numPlayers;
      intervalIndex++;
      
      if (intervalIndex < intervals.length) {
        setTimeout(animate, intervals[intervalIndex]);
      }
    };
    
    animate();
  };

  const { data: randomizationHistory } = api.session.getRandomizationHistory.useQuery(
    { gameSessionId: game?.sessionId ?? "" },
    { enabled: !!game?.sessionId }
  );


  const [description, setDescription] = useState<string>(game?.description ?? "");
  const [dateText, setDateText] = useState<string>("");

  useEffect(() => {
    setDateText(formatDate(game?.createdAt) ?? "");
  }, [game?.createdAt]);

  useEffect(() => {
    setDescription(game?.description ?? "");
  }, [game?.description]);

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
            <StatusBadge color="green">
              {game.status}
            </StatusBadge>
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
                  className="relative rounded-b-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600 dark:ring-gray-600">
                  <label htmlFor="date" className="block text-xs font-medium text-gray-900 dark:text-white">
                    Date
                  </label>
                  {!updateDate.isLoading  ?
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden bg-white shadow sm:rounded-lg dark:bg-gray-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortPlayers(game.players).map((player, index) => (
              <PlayerView
                key={player.playerId}
                player={player}
                updatePlayer={updatePlayer}
                isInReadOnlyMode={isInReadOnlyMode}
                numberOfPlayers={game.players.length + 1}
                isRolling={rollingPlayerIndex === index}
              ></PlayerView>
            ))}
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
                onClick={() => {
                  startRollingAnimation(game.players.length);
                  rollStartingPlayer.mutate({ gameSessionId: game.sessionId });
                }}
                disabled={rollStartingPlayer.isLoading}
              >
                {rollStartingPlayer.isLoading ? "Rolling..." : "Roll Starting Player"}
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
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                  Latest Seat Assignments:
                </h4>
                <div className="text-sm text-green-800 dark:text-green-200">
                  {Object.entries(seatAssignments).map(([player, seat]) => (
                    <div key={player} className="mb-1">
                      <span className="font-medium">{player}:</span> Seat {seat}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {startingPlayer && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Latest Starting Player:
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
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
                setHaveError(false);
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
