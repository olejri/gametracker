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
                  className="relative rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="expansion" className="block text-xs font-medium text-gray-900">
                    Expansions
                  </label>
                  <div
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  >
                    {game.expansions.map((expansion) => (
                      <span
                        key={expansion.gameId}
                        className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                  {expansion.gameName}
                </span>))}
                  </div>
                </div>}
                <div
                  className="relative rounded-b-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="date" className="block text-xs font-medium text-gray-900">
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
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortPlayers(game.players).map((player) => (
              <PlayerView
                key={player.playerId}
                player={player}
                updatePlayer={updatePlayer}
                isInReadOnlyMode={isInReadOnlyMode}
                numberOfPlayers={game.players.length + 1}
              ></PlayerView>
            ))}
          </div>
        </div>
      </div>
      {game.status === GameSessionStatus.Ongoing ? <div className="overflow-hidden bg-white shadow sm:rounded-lg">
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
          {haveError ? <div className="text-center mt-4 text-red-600">Error while finish or deleting the session</div> : <></>}
        </div>
      </div> : <> </>}
    </div>
  );
};
export default GameSession;
