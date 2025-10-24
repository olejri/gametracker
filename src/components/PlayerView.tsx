import type { PlayerNicknameAndScore } from "npm/components/Types";
import Image from "next/image";
import React from "react";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";

const PlayerView = (props: {
  player: PlayerNicknameAndScore,
  updatePlayer: (player: PlayerNicknameAndScore) => void,
  isInReadOnlyMode: boolean
  numberOfPlayers: number
}) => {
  const { isInReadOnlyMode, numberOfPlayers } = props;
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


  return (
    <div
      key={player.playerId}
      className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
    >
      <div className="flex-shrink-0">
        <Image
          width={30}
          height={30}
          key={player.playerId}
          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
          src={player.profileImageUrl}
          alt={player.nickname ?? player.playerId}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-flow-row-dense grid-cols-3 gap-10">
          <p className="text-sm font-medium text-gray-900">{player.nickname}</p>
          <div className="grid grid-cols-1">
            <label>Score</label>
            {!isUpdatingScore ? <input type="text" id={"score" + player.playerId}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
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
            <label>Position</label>
            {!isUpdatingPos ? (
              <select
                disabled={isInReadOnlyMode}
                id={player.playerId}
                name={"position" + player.playerId}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent appearance-none"
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
                      <option key={i} value={i}>
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
      </div>
      <div>
      </div>
    </div>
  );
};

export default PlayerView;