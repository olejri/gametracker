import type { DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import React, { useState } from "react";
import { useRouter } from "next/router";
import type { Game } from "npm/components/Types";

const StartNewGame = (props: DashboardProps) => {
  const { data: games } = api.game.getAllGames.useQuery({ withExpansions: false });
  const { data: expansions } = api.game.getAllGames.useQuery({ withExpansions: true });
  const { data: players } = api.player.getPlayers.useQuery({ groupId: props.groupName });
  const router = useRouter();
  const [chosenGame, setChosenGame] = useState("");
  const [chosenExpansions, setChosenExpansions] = useState<Game[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [generateYourGameSession, setGenerateYourGameSession] = useState(false);
  const [error, setError] = useState<string>("");

  const mutate = api.session.startANewGameSession.useMutation({
    onSuccess: (session) => {
      void router.push("/[dashboardId]/session/[sessionId]", `/${props.groupName}/session/${session.id}`);
    },
    onError: (error) => {
      setError(error.message);
      setDisabled(false);
    },
    onMutate: () => {
      setDisabled(true);
      setGenerateYourGameSession(true);
    }
  });

  if(error) {
    return <div className="text-center mt-4">{error}</div>;
  }

  if(generateYourGameSession) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (!games || !players || !expansions) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }
  const gameMap = new Map<string, Game[]>();
  // map expansions to games
  expansions.forEach((expansion) => {
    if (expansion.baseGameId) {
      if (!gameMap.has(expansion.baseGameId)) {
        gameMap.set(expansion.baseGameId, []);
      }
      gameMap.get(expansion.baseGameId)?.push(expansion);
    }
  });


  return (
  <form id="game">
    <div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <select
            value={chosenGame}
            onChange={(event) => {
              setChosenGame(event.target.value);
              setChosenExpansions(gameMap.get(event.target.value) || []);
            }}
          >
            <option value="">Select a game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>

        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          {chosenExpansions.length > 0 ? <fieldset>
            <legend className="text-base font-semibold leading-6 text-gray-900">Expansions</legend>
            <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
              {chosenExpansions.map((game, personIdx) => (
                <div key={personIdx} className="relative flex items-start py-4">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label htmlFor={`person-${game.id}`} className="select-none font-medium text-gray-900">
                      {game.name}
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center">
                    <input
                      id={`exp-${game.id}`}
                      name={`exp-${game.id}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset> : <></>
          }
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <fieldset>
            <legend className="text-base font-semibold leading-6 text-gray-900">Players</legend>
            <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
              {players.data.map((person, personIdx) => (
                <div key={personIdx} className="relative flex items-start py-4">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label htmlFor={`person-${person.id}`} className="select-none font-medium text-gray-900">
                      {person.nickname ?? person.name}
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center">
                    <input
                      id={`person-${person.id}`}
                      name={`person-${person.id}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <button
            disabled={disabled}
            className={"bg-blue-500 hover:bg-blue-700 disabled:bg-gray-600 text-white disabled:text-gray-400 font-bold py-2 px-4 rounded"}
            onClick={(event) => {
              event.preventDefault(); // prevent default form submitting behavior
              // mutate.mutate({
              //   gameId: chosenGame,
              //   groupId: props.groupName
              // });
              const form = document.getElementById("game");
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const formData = new FormData(form);
              const playerIds = [];
              const expansionIds = [];
              for (const [name, value] of formData.entries()) {
                if (name.startsWith("person-") && value === "on") {
                  playerIds.push(name.substr(7));
                }
                if (name.startsWith("exp-") && value === "on") {
                  expansionIds.push(name.substr(4));
                }
              }
              mutate.mutate({
                gameId: chosenGame,
                groupId: props.groupName,
                players: playerIds,
                expansions: expansionIds
              });
            }}
          >Create session
          </button>
        </div>
      </div>
    </div>
    </form>
  );
};

export default StartNewGame;