import Image from "next/image";
import React, { useMemo, useState } from "react";
import { AcademicCapIcon, ChevronDownIcon, PuzzlePieceIcon } from "@heroicons/react/24/solid";
import BggRatingBadge from "npm/components/BggRatingBadge";
import InfoModal from "npm/components/InfoModal";
import PoweredByBgg from "npm/components/PoweredByBgg";
import { classNames } from "npm/lib/utils";
import type { GameWithOwners, OpenWithGameId } from "npm/components/Types";

type GameGridProps = {
  games: GameWithOwners[];
  // Shown above the sort controls, e.g. the collection's ownership filter
  filters?: React.ReactNode;
  title?: string;
  // Background of the title label, so it hides the divider line behind it
  titleClassName?: string;
  gridClassName?: string;
  showOwners?: boolean;
  onRemove?: (game: GameWithOwners) => void;
};

const sortOptions = [
  { id: "name", name: "Name" },
  { id: "bgg", name: "BGG rating" }
] as const;

type SortBy = typeof sortOptions[number]["id"];

// BGG rating: best rating as shown (one decimal) first, ties broken by BGG rank
// (#1 first, unranked after ranked), then by name. Games without a rating go last.
const shownRating = (game: GameWithOwners) =>
  game.bggAverage === null ? -1 : Math.round(game.bggAverage * 10);

const compareGames = (sortBy: SortBy) => (a: GameWithOwners, b: GameWithOwners) => {
  if (sortBy === "bgg") {
    if (shownRating(a) !== shownRating(b)) return shownRating(b) - shownRating(a);
    if (a.bggRank !== b.bggRank) return (a.bggRank ?? Infinity) - (b.bggRank ?? Infinity);
  }
  return a.name.localeCompare(b.name);
};

const GameGrid = ({
  games,
  filters,
  title = "Games",
  titleClassName = "bg-white dark:bg-gray-900 sm:dark:bg-gray-800",
  gridClassName = "lg:grid-cols-3 xl:grid-cols-4",
  showOwners = false,
  onRemove
}: GameGridProps) => {
  const [modalOpen, setModalOpen] = useState<OpenWithGameId>({ open: false, name: "" });
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [showExpansions, setShowExpansions] = useState(false);
  const [openBaseGames, setOpenBaseGames] = useState<Set<string>>(new Set());

  // Expansions are listed right after their base game, and only when that base
  // game is opened (or all expansions are shown). An expansion whose base game
  // isn't in the list stays a card of its own.
  const { cards, expansionsByBase } = useMemo(() => {
    const sorted = [...games].sort(compareGames(sortBy));
    const shownIds = new Set(sorted.map((game) => game.id));
    const byBase = new Map<string, GameWithOwners[]>();
    const topLevel: GameWithOwners[] = [];
    for (const game of sorted) {
      if (game.isExpansion && game.baseGameId && shownIds.has(game.baseGameId)) {
        byBase.set(game.baseGameId, [...(byBase.get(game.baseGameId) ?? []), game]);
      } else {
        topLevel.push(game);
      }
    }
    const list = topLevel.flatMap((game) =>
      showExpansions || openBaseGames.has(game.id) ? [game, ...(byBase.get(game.id) ?? [])] : [game]
    );
    return { cards: list, expansionsByBase: byBase };
  }, [games, sortBy, showExpansions, openBaseGames]);

  const toggleBaseGame = (gameId: string) => {
    setOpenBaseGames((open) => {
      const next = new Set(open);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  return (
    <>
      {filters}

      <div className={classNames("flex items-center gap-3", filters ? "mt-5" : "")}>
        <span className="text-sm font-medium text-gray-900 dark:text-white">Sort by</span>
        <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Sort games">
          {sortOptions.map((option, index) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={sortBy === option.id}
              onClick={() => setSortBy(option.id)}
              className={classNames(
                "px-3 py-1.5 text-sm font-medium ring-1 ring-inset focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                index === 0 ? "rounded-l-md" : "-ml-px rounded-r-md",
                sortBy === option.id
                  ? "bg-indigo-600 text-white ring-indigo-600"
                  : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
              )}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5 flex items-start">
        <div className="flex h-6 items-center">
          <input
            id="show-expansions"
            type="checkbox"
            checked={showExpansions}
            onChange={(e) => {
              setShowExpansions(e.target.checked);
              setOpenBaseGames(new Set());
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <label htmlFor="show-expansions" className="ml-3 text-sm font-medium leading-6 text-gray-900 dark:text-white">
          Show expansions
        </label>
      </div>

      <div className="relative mt-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center">
          <span className={classNames("px-3 text-base font-semibold leading-6 text-gray-900 dark:text-white", titleClassName)}>{title}</span>
        </div>
      </div>

      <ul role="list" className={classNames("mt-5 grid grid-cols-2 gap-3 sm:gap-6", gridClassName)}>
        {cards.map((game) => (
          <li
            key={game.id}
            className={classNames(
              "col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg text-center shadow dark:divide-gray-700",
              game.isExpansion ? "bg-gray-50 ring-1 ring-indigo-200 dark:bg-gray-700 dark:ring-indigo-900" : "bg-white dark:bg-gray-800"
            )}
          >
            <div className="flex flex-1 flex-col p-4 sm:p-8">
              <Image className="mx-auto h-24 w-24 flex-shrink-0 object-cover sm:h-40 sm:w-40 sm:object-contain" src={game.image_url} alt="" width={200}
                     height={200} priority={true} />
              <h3 className="mt-3 text-sm font-medium text-gray-900 sm:mt-6 dark:text-white">{game.name}</h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between sm:justify-start">
                <dd className="text-sm text-gray-500 dark:text-gray-400">Players: {game.players}</dd>
                <dd className="text-sm text-gray-500 dark:text-gray-400">Time: {game.playtime}</dd>
                {game.bggId !== null && game.bggAverage !== null && (
                  <dd className="mt-2">
                    <BggRatingBadge bggId={game.bggId} bggAverage={game.bggAverage} bggRank={game.bggRank}
                                    className="text-xs sm:text-sm" />
                  </dd>
                )}
                {onRemove && (
                  <dd className="mt-2 sm:mt-auto sm:pt-3">
                    <button
                      type="button"
                      className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => onRemove(game)}
                    >
                      Remove
                    </button>
                  </dd>
                )}
              </dl>
              {showOwners && (
                <>
                  <h3 className="mt-6 text-sm font-medium text-gray-900 dark:text-white">Owned by:</h3>
                  <dl>
                    {game.ownedByPlayers?.map((name) => (
                      <dd key={name} className="text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {name}
                        </span>
                      </dd>
                    ))}
                  </dl>
                </>)}
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-700">
                <div className="flex w-0 flex-1">
                  {(() => {
                    const expansionCount = expansionsByBase.get(game.id)?.length ?? 0;
                    const cellClass = "relative -mr-px w-0 flex-1 inline-flex items-center justify-center gap-x-1 rounded-bl-lg border border-transparent py-3 text-xs font-semibold sm:gap-x-2 sm:whitespace-nowrap sm:py-4 sm:text-sm";
                    if (game.isExpansion) {
                      return <div className={classNames(cellClass, "text-gray-500 dark:text-gray-400")}>Expansion</div>;
                    }
                    if (expansionCount === 0) {
                      return <div className={classNames(cellClass, "text-green-500 dark:text-green-400")}>Base game</div>;
                    }
                    const isOpen = showExpansions || openBaseGames.has(game.id);
                    return (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        disabled={showExpansions}
                        onClick={() => toggleBaseGame(game.id)}
                        className={classNames(cellClass, "text-indigo-600 hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent dark:text-indigo-400 dark:hover:bg-gray-700")}
                      >
                        <PuzzlePieceIcon className="h-4 w-4 sm:hidden" aria-hidden="true" />
                        <span className="sm:hidden">{expansionCount}</span>
                        <span className="sr-only sm:not-sr-only">
                          {expansionCount} {expansionCount === 1 ? "expansion" : "expansions"}
                        </span>
                        <ChevronDownIcon
                          className={classNames("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })()}
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <button
                    className={`relative inline-flex w-0 flex-1 items-center justify-center gap-x-1 rounded-br-lg border border-transparent py-3 text-xs font-semibold sm:gap-x-2 sm:whitespace-nowrap sm:py-4 sm:text-sm text-gray-900 dark:text-white`}
                    onClick={() => {
                      setModalOpen({ open: true, name: game.name });
                    }}
                  >
                    <AcademicCapIcon className="hidden h-5 w-5 text-gray-600 sm:block dark:text-gray-400" aria-hidden="true" />
                    Description
                  </button>
                  <InfoModal
                    open={modalOpen}
                    gameName={game.name}
                    setOpen={setModalOpen}
                    title={game.name}
                    message={game.description}
                    categories={(game as unknown as { GameCategory?: Array<{ category: { name: string } }> }).GameCategory?.map(gc => gc.category.name).join(", ") || "None"}
                    mechanics={(game as unknown as { GameMechanic?: Array<{ mechanic: { name: string } }> }).GameMechanic?.map(gm => gm.mechanic.name).join(", ") || "None"}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {cards.some((game) => game.bggId !== null) && <PoweredByBgg className="mt-6" />}
    </>
  );
};

export default GameGrid;
