import type { DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import React, { useState } from "react";
import { useRouter } from "next/router";
import type { Game } from "npm/components/Types";
import SelectWithSearch from "npm/components/SelectWithSearch";
import { Button } from "npm/components/ui";

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
  const [validationError, setValidationError] = useState<string>("");

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

  if (error) {
    return <div className="text-center mt-4 text-gray-900 dark:text-white">{error}</div>;
  }

  if (generateYourGameSession) {
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

  function setChosenGameAndExpansions(gameObject: string) {
    const game: Game = gameObject as unknown as Game;
    setChosenGame(gameObject);
    setChosenExpansions(gameMap.get(game.id) ?? []);
  }

  return (
    <>
      <form id="game">
        <div className="overflow-hidden rounded-lg bg-white sm:shadow w-full sm:w-6/12 dark:bg-gray-800">
          <div className="overflow-hidden rounded-lg shadow-none">
            <div className="px-4 py-5 sm:p-6">
              <SelectWithSearch items={games} selectedItem={chosenGame} setSelectedItem={setChosenGameAndExpansions}
                                title={"Pick a game"} placeholder={""} />
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow-none dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              {chosenExpansions.length > 0 ? <fieldset>
                <legend className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Pick expansions</legend>
                <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                  {chosenExpansions.map((game) => (
                    <div key={game.id} className="relative flex items-start py-4">
                      <div className="min-w-0 flex-1 text-sm leading-6">
                        <label htmlFor={`person-${game.id}`} className="select-none font-medium text-gray-900 dark:text-white">
                          {game.name}
                        </label>
                      </div>
                      <div className="ml-3 flex h-6 items-center">
                        <input
                          id={`exp-${game.id}`}
                          name={`exp-${game.id}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset> : <></>
              }
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow-none dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <fieldset>
                <legend className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Pick players</legend>
                <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                  {players.data.map((person) => (
                    <div key={person.id} className="relative flex items-start py-4">
                      <div className="min-w-0 flex-1 text-sm leading-6">
                        <label htmlFor={`person-${person.id}`} className="select-none font-medium text-gray-900 dark:text-white">
                          {person.nickname ?? person.name}
                        </label>
                      </div>
                      <div className="ml-3 flex h-6 items-center">
                        <input
                          id={`person-${person.id}`}
                          name={`person-${person.id}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
          <div className="overflow-hidden shadow-none dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <Button
                disabled={disabled}
                variant="primary"
                onClick={(event) => {
                  event.preventDefault(); // prevent default form submitting behavior
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
                  // Validate that at least one player and one game are selected
                  if (!chosenGame || playerIds.length === 0) {
                    setValidationError("Please select at least one game and one player.");
                    return;
                  }
                  const game = chosenGame as unknown as Game;
                  mutate.mutate({
                    gameId: game.id,
                    groupId: props.groupName,
                    players: playerIds,
                    expansions: expansionIds
                  });
                }}
              >
                Create session
              </Button>
              {validationError && <div className="text-center mt-4 text-red-500">{validationError}</div>}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default StartNewGame;