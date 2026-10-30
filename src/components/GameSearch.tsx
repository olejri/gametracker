import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircleIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import { api } from "npm/utils/api";
import { LoadingSpinner } from "npm/components/loading";
import BggRatingBadge from "npm/components/BggRatingBadge";
import PoweredByBgg from "npm/components/PoweredByBgg";
import { Button, Card, CardContent, Input, StatusBadge } from "npm/components/ui";
import { classNames } from "npm/lib/utils";

// Adds games to the collection from a BoardGameGeek search, with their details
// and rating filled in from BGG.
const GameSearch = () => {
  const router = useRouter();
  const groupName = router.query.dashboardId as string;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addedName, setAddedName] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const ctx = api.useContext();
  const search = api.game.searchBgg.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2, retry: false, refetchOnWindowFocus: false }
  );
  const details = api.game.getBggGame.useQuery(
    { bggId: selectedId ?? 0 },
    { enabled: selectedId !== null, retry: false, refetchOnWindowFocus: false }
  );
  const addGame = api.game.addGameFromBgg.useMutation({
    onSuccess: ({ game }) => {
      setAddedName(game.name);
      setSelectedId(null);
      void ctx.game.getAllGames.invalidate();
      void ctx.game.searchBgg.invalidate();
    }
  });

  const customGameLink = (
    <Link href={`/${groupName}/games/make-custom`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
      make a custom game
    </Link>
  );

  if (selectedId !== null) {
    const game = details.data;
    return (
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to results
        </button>
        {details.isLoading && <div className="flex justify-center py-10"><LoadingSpinner size={40} /></div>}
        {details.isError && <p className="text-sm text-red-700 dark:text-red-300">{details.error.message}</p>}
        {game && (
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                {game.image && (
                  <Image src={game.image} alt="" width={300} height={300}
                         className="mx-auto h-40 w-40 flex-shrink-0 rounded-lg object-contain sm:mx-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {game.name}{game.year ? <span className="font-normal text-gray-500 dark:text-gray-400"> ({game.year})</span> : null}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <BggRatingBadge bggId={game.bggId} bggAverage={game.average} bggRank={game.rank} />
                    <StatusBadge color={game.isExpansion ? "blue" : "green"}>{game.isExpansion ? "Expansion" : "Base game"}</StatusBadge>
                  </div>
                  <dl className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <div><dt className="inline font-medium">Players: </dt><dd className="inline">{game.players}</dd></div>
                    <div><dt className="inline font-medium">Time: </dt><dd className="inline">{game.playtime}</dd></div>
                    {game.isExpansion && (
                      <div>
                        <dt className="inline font-medium">Base game: </dt>
                        <dd className="inline">
                          {game.baseGame ? game.baseGame.name : "not in the collection yet, so it's added on its own"}
                        </dd>
                      </div>
                    )}
                    {game.mechanics.length > 0 && (
                      <div><dt className="inline font-medium">Mechanics: </dt><dd className="inline">{game.mechanics.join(", ")}</dd></div>
                    )}
                    {game.categories.length > 0 && (
                      <div><dt className="inline font-medium">Categories: </dt><dd className="inline">{game.categories.join(", ")}</dd></div>
                    )}
                  </dl>
                </div>
              </div>
              {game.description && (
                <p className="mt-4 max-h-48 overflow-y-auto whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
              )}
              <div className="mt-5">
                {game.alreadyAdded ? (
                  <StatusBadge color="gray">Already in the collection</StatusBadge>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full justify-center disabled:opacity-50 sm:w-auto"
                    disabled={addGame.isLoading}
                    onClick={() => addGame.mutate({ bggId: game.bggId })}
                  >
                    {addGame.isLoading ? "Adding…" : "Add to collection"}
                  </Button>
                )}
                {addGame.isError && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{addGame.error.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}
        <PoweredByBgg label="Game data" className="mt-6" />
      </div>
    );
  }

  const notSetUp = search.error?.data?.code === "PRECONDITION_FAILED";

  return (
    <div className="mx-auto max-w-2xl">
      {addedName && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p>
            {addedName} was added.{" "}
            <Link href={`/${groupName}/games/collection`} className="font-medium underline">See the collection</Link>
          </p>
        </div>
      )}
      <Input
        label="Search BoardGameGeek"
        placeholder="e.g. Wingspan"
        value={query}
        autoFocus
        onChange={(e) => {
          setQuery(e.target.value);
          setAddedName(null);
        }}
      />
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Not a board game, like padel or a video game? Then {customGameLink} instead.
      </p>

      {search.isFetching && <div className="flex justify-center py-6"><LoadingSpinner size={30} /></div>}
      {notSetUp && <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">BGG search isn&apos;t set up yet. For now, {customGameLink}.</p>}
      {search.isError && !notSetUp && <p className="mt-4 text-sm text-red-700 dark:text-red-300">{search.error.message}</p>}
      {search.data && !search.isFetching && (
        search.data.length === 0 ? (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">No games found on BGG for &quot;{debouncedQuery}&quot;.</p>
        ) : (
          <ul role="list" className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow dark:divide-gray-700 dark:bg-gray-800">
            {search.data.map((result) => (
              <li key={result.bggId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(result.bggId)}
                  className={classNames(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700",
                    result.alreadyAdded && "opacity-60"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{result.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{result.year ?? "Year unknown"}</span>
                  </span>
                  <span className="flex flex-shrink-0 gap-1">
                    {result.isExpansion && <StatusBadge color="blue" className="text-xs">Expansion</StatusBadge>}
                    {result.alreadyAdded && <StatusBadge color="gray" className="text-xs">Added</StatusBadge>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
      <PoweredByBgg label="Search results" className="mt-6" />
    </div>
  );
};

export default GameSearch;
