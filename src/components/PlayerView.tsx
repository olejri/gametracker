import type { PlayerNicknameAndScore, GameSessionTeam } from "npm/components/Types";
import Image from "next/image";
import React from "react";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";

const PlayerView = (props: {
  player: PlayerNicknameAndScore,
  updatePlayer: (player: PlayerNicknameAndScore) => void,
  isInReadOnlyMode: boolean
  numberOfPlayers: number
  isRolling?: boolean
  isTeamGame?: boolean
  teams?: GameSessionTeam[]
  gameSessionId?: string
}) => {
  const { isInReadOnlyMode, numberOfPlayers, isRolling, isTeamGame, teams, gameSessionId } = props;
  const [player, setPlayer] = React.useState<PlayerNicknameAndScore>(props.player);
  const [isUpdatingPos, setIsUpdatingPos] = React.useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = React.useState(false);
  const ctx = api.useContext();
  const mutateScore = api.session.updatePlayerScoreJunction.useMutation({
    onSuccess: () => {
      setIsUpdatingScore(false);
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

  // Find the current team for this player
  const currentTeam = teams?.find((t) => t.playerIds.includes(player.playerId));
  const teamBorderColor = isTeamGame && currentTeam ? currentTeam.color : undefined;


  return (
    <div
      key={player.playerId}
      className={`relative flex items-center space-x-3 rounded-lg bg-white px-6 py-5 shadow-sm hover:border-gray-400 dark:bg-gray-800 dark:hover:border-gray-500 ${isRolling ? 'player-rolling-animation' : ''}`}
      style={{
        border: teamBorderColor ? `3px solid ${teamBorderColor}` : '1px solid',
        borderColor: teamBorderColor || undefined
      }}
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
        <div className="grid grid-flow-row-dense grid-cols-3 gap-10">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{player.nickname}</p>
          <div className="grid grid-cols-1">
            <label className="dark:text-gray-300">Score</label>
            {!isUpdatingScore ? <input type="text" id={"score" + player.playerId}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-gray-600"
                   value={player.score}
                   readOnly={isInReadOnlyMode}
                   required
                   onChange={(e) => {
                      setPlayer({
                        ...player,
                        score: e.target.value,
                      });
                   }}
                   onBlur={() => {
                     if(isInReadOnlyMode) return;
                     mutateScore.mutate(player);}
                   }
            />: <LoadingSpinner />}
          </div>
          <div className="grid grid-cols-1">
            <label className="dark:text-gray-300">Position</label>
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
                defaultValue={player.position}
                onChange={(e) => {
                  setPlayer({
                    ...player,
                    position: +e.target.value,
                  });
                }}
                onBlur={() => {
                  if (isInReadOnlyMode) return;
                  mutatePos.mutate(player);
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
        </div>
        {/* Team Selector - Only shown when team game mode is active */}
        {isTeamGame && teams && teams.length > 0 && !isInReadOnlyMode && gameSessionId && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Team:</span>
            <div className="flex gap-1">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => updatePlayerTeam.mutate({
                    gameSessionId: gameSessionId,
                    playerId: player.playerId,
                    teamId: team.id
                  })}
                  disabled={updatePlayerTeam.isLoading}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    currentTeam?.id === team.id
                      ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-gray-800"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: team.color,
                    color: "white"
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
      </div>
    </div>
  );
};

export default PlayerView;