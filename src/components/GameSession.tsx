import { type GameSessionProps, GameSessionStatus,type PlayerNicknameAndScore } from "npm/components/Types";
import { sortPlayers } from "npm/components/HelperFunctions";
import { api } from "npm/utils/api";
import Image from "next/image";
import { LoadingPage } from "npm/components/loading";
import React from "react";
import PlayerView from "npm/components/PlayerView";
import dayjs from "dayjs";

const GameSession = (props: GameSessionProps) => {
  const {
    data: game,
    isError,
    isLoading: sessionIsLoading,
    error
  } = api.session.getGameASession.useQuery({ data: { id: props.gameId } });
  const ctx = api.useContext();
  const [haveError, setHaveError] = React.useState(false);

  const updateGameSession = api.session.updateGameSession.useMutation({
    onSuccess: () => {
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

  if (sessionIsLoading) {
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
          <div className="grid grid-cols-2">
            <p>GAME INFO:</p>
            <label></label>
            <label>Name:</label>
            <label>{game.gameName}</label>
            <label>Expansions:</label>
            <div>
              {game.expansions.map((expansion) => (
                <span
                  key={expansion.gameId}
                  className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                  {expansion.gameName}
                </span>))}
            </div>
            <label>Description:</label>
            <label>{game.description}</label>
            <label>Date</label>
            <p>{dayjs(game.updatedAt).format("DD.MM.YYYY")}</p>
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
              ></PlayerView>
            ))}
          </div>
        </div>
      </div>
      {game.status === GameSessionStatus.Ongoing ? <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
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
            {haveError ? <div className="text-center mt-4 text-red-600">Error while finishing session</div> : <></>}
        </div>
      </div> : <> </>}
    </div>
  );
};
export default GameSession;
