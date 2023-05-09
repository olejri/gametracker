import type { DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import React, { useState } from "react";
import { useRouter } from "next/router";
import type { Game } from "npm/components/Types";
import SelectWithSearch from "npm/components/SelectWithSearch";
import Link from "next/link";
import { sortPlayers } from "npm/components/HelperFunctions";
import Image from "next/image";

const StartNewGame = (props: DashboardProps) => {
  const { data: games } = api.game.getAllGames.useQuery({ withExpansions: false });
  const { data: expansions } = api.game.getAllGames.useQuery({ withExpansions: true });
  const { data: players } = api.player.getPlayers.useQuery({ groupId: props.groupName });
  const { data: gamesInGroup } = api.group.getAllGamesOwnedByTheGroup.useQuery({ groupId: props.groupName });
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

  if (error) {
    return <div className="text-center mt-4">{error}</div>;
  }

  if (generateYourGameSession) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (!games || !players || !expansions || !gamesInGroup) {
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

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  function setChosenGameAndExpansions(gameObject: string) {
    const game: Game = gameObject as unknown as Game;
    setChosenGame(gameObject);
    setChosenExpansions(gameMap.get(game.id) ?? []);
  }

  return (
    <>
      <form id="game">
        <div className="overflow-hidden rounded-lg bg-white sm:shadow w-full sm:w-6/12">
          <div className="overflow-hidden rounded-lg shadow-none">
            <div className="px-4 py-5 sm:p-6">
              <SelectWithSearch items={games} selectedItem={chosenGame} setSelectedItem={setChosenGameAndExpansions}
                                title={"Pick a game"} placeholder={""} />
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow-none">
            <div className="px-4 py-5 sm:p-6">
              {chosenExpansions.length > 0 ? <fieldset>
                <legend className="text-base font-semibold leading-6 text-gray-900">Pick expansions</legend>
                <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
                  {chosenExpansions.map((game) => (
                    <div key={game.id} className="relative flex items-start py-4">
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
          <div className="overflow-hidden rounded-lg bg-white shadow-none">
            <div className="px-4 py-5 sm:p-6">
              <fieldset>
                <legend className="text-base font-semibold leading-6 text-gray-900">Pick players</legend>
                <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
                  {players.data.map((person) => (
                    <div key={person.id} className="relative flex items-start py-4">
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
          <div className="overflow-hidden shadow-none">
            <div className="px-4 py-5 sm:p-6">
              <button
                disabled={disabled}
                className={"bg-blue-500 hover:bg-blue-700 disabled:bg-gray-600 text-white disabled:text-gray-400 font-bold py-2 px-4 rounded"}
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
                  const game = chosenGame as unknown as Game;
                  mutate.mutate({
                    gameId: game.id,
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

      <div className="px-4 sm:px-6 lg:px-14">
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                  >
                    Game name
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                  >
                    Number of games
                  </th>
                </tr>
                </thead>
                <tbody>
                {gamesInGroup.map((game, gameIdx) => (
                  <tr key={game.gameName}>
                    <td
                      className={classNames(
                        gameIdx !== gamesInGroup.length - 1 ? "border-b border-gray-300" : "",
                        "w-6 py-4 pl-4 pr-3 text-sm font-smale text-gray-900 sm:pl-6 lg:pl-8"
                      )}
                    >
                      {game.gameName}
                    </td>
                    <td
                      className={classNames(
                        gameIdx !== gamesInGroup.length - 1 ? "border-b border-gray-300" : "",
                        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                      )}
                    >
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-hidden">
                          {sortPlayers(game.owedByPlayers).map((player) => (
                            <Image
                              width={300}
                              height={300}
                              key={player.playerId}
                              className={"inline-block h-6 w-6 rounded-full border-2 border-white"}
                              src={player.profileImageUrl}
                              alt={player.nickname ?? player.playerId}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartNewGame;