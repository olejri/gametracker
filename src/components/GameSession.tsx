import { type GameSessionProps, GameSessionStatus, type PlayerNicknameAndScore } from "npm/components/Types";
import { sortPlayers } from "npm/components/HelperFunctions";
import { api } from "npm/utils/api";
import Image from "next/image";
import { LoadingPage } from "npm/components/loading";
import React from "react";
import PlayerView from "npm/components/PlayerView";
import dayjs from "dayjs";
import { useRouter } from "next/router";

const GameSession = (props: GameSessionProps) => {
  const {
    data: game,
    isError,
    isLoading: sessionIsLoading,
    error
  } = api.session.getGameASession.useQuery({ data: { id: props.gameId } });
  const ctx = api.useContext();
  const [haveError, setHaveError] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
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

  if (sessionIsLoading || isUpdating) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }
  if (isError) {
    return <div className="text-center mt-4">{error?.message}</div>;
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
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="grid grid-cols-2">
          <div className="px-4 py-5 sm:p-6">
            <Image src={game.image_url} alt="My Image" width={300} height={300} className="rounded-lg mt-4" />
            <span
              className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
            {game.status}
          </span>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="isolate -space-y-px rounded-md shadow-sm">
                <div
                  className="relative rounded-md rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                    Game Name
                  </label>
                  <input
                    type="text"
                    readOnly={true}
                    value={game.gameName}
                    name="name"
                    id="name"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Game Name"
                  />
                </div>
                <div
                  className="relative rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="description" className="block text-xs font-medium text-gray-900">
                    Description
                  </label>
                  <input
                    type="text"
                    readOnly={isInReadOnlyMode}
                    value={game.description}
                    name="description"
                    id="description"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
                {game.expansions.length > 0 && <div
                  className="relative rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="expansion" className="block text-xs font-medium text-gray-900">
                    Expansions
                  </label>
                  <div
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
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
                  className="relative rounded-b-none rounded-b-md px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="date" className="block text-xs font-medium text-gray-900">
                    Date
                  </label>
                  <input
                    type="datetime"
                    readOnly={isInReadOnlyMode}
                    value={dayjs(game.updatedAt).format("DD.MM.YYYY")}
                    name="date"
                    id="date"
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
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
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isInReadOnlyMode}
              onClick={() => {
                setHaveError(false);
                deleteGameSession.mutate({ sessionId: game.sessionId })
              }}
            >
              Delete session
            </button>
          </div>
          {haveError ? <div className="text-center mt-4 text-red-600">Error while finish or deleting the session</div> : <></>}
        </div>
      </div> : <> </>}
    </div>
  );
};
export default GameSession;
