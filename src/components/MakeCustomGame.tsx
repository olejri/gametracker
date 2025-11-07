import type { RouterInputs } from "npm/utils/api";
import React from "react";
import { api } from "npm/utils/api";
import { LoadingPage, LoadingSpinner } from "npm/components/loading";
import { useRouter } from "next/router";
import { Button } from "npm/components/ui";

const MakeCustomGame = () => {
  const { data: games } = api.game.getAllGames.useQuery({ withExpansions: false });
  type Game = RouterInputs["game"]["addGame"];
  const router = useRouter();

  const mutation = api.game.addGame.useMutation({
    onSuccess: () => {
      void router.push("/");
    },
  });

  const [game, setGame] = React.useState<Game>({
      name: "",
      description: "",
      players: "",
      playtime: "",
      mechanics: "",
      categories: "",
      image_url: "",
      isExpansion: false,
      baseGameId: undefined
  });

  if (!games) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="isolate -space-y-px rounded-md shadow-sm">
              <div
                className="relative rounded-md rounded-b-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                  Name
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        name: e.target.value
                    });}}
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Game Name"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="description" className="block text-xs font-medium text-gray-900">
                  Description
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        description: e.target.value
                    });}}
                  type="text"
                  name="description"
                  id="description"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Short description of the game"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="image_url" className="block text-xs font-medium text-gray-900">
                  Image Url
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        image_url: e.target.value
                    });}}
                  type="text"
                  name="image_url"
                  id="image_url"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Full path to image"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="players" className="block text-xs font-medium text-gray-900">
                  Players
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        players: e.target.value
                    });}}
                  type="text"
                  name="players"
                  id="players"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="2-6"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="playtime" className="block text-xs font-medium text-gray-900">
                  Playtime
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        playtime: e.target.value
                    });}}
                  type="text"
                  name="playtime"
                  id="playtime"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="60-120"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="mechanics" className="block text-xs font-medium text-gray-900">
                  Mechanics
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        mechanics: e.target.value
                    });}}
                  type="text"
                  name="mechanics"
                  id="mechanics"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Card Drafting, Hand Management"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="categories" className="block text-xs font-medium text-gray-900">
                  Categories
                </label>
                <input
                  onBlur={(e) => {
                    setGame({
                        ...game,
                        categories: e.target.value
                    });}}
                  type="text"
                  name="categories"
                  id="categories"
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Adventure, Animals, Asymmetric"
                />
              </div>
              <div
                className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="expansion" className="block text-xs font-medium text-gray-900">
                  Is expansion?
                </label>
                <input
                  checked={game.isExpansion}
                  onChange={(event) => {
                    if(event.target.checked) {
                      setGame({
                          ...game,
                          isExpansion: event.target.checked
                      });
                    } else {
                      setGame({
                          ...game,
                          isExpansion: event.target.checked,
                          baseGameId: undefined
                      });
                    }
                  }}
                  type="checkbox"
                  name="expansion"
                  id="expansion"
                  className="block h-6 w-6 border-2 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Adventure, Animals, Asymmetric"
                />
              </div>
              {game.isExpansion && (
                <div
                  className="relative rounded-t-none px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                  <label htmlFor="basegame" className="block text-xs font-medium text-gray-900">
                    Base game
                  </label>
                  <select
                    value={game.baseGameId}
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    name="basegame"
                    id="basegame"
                    onChange={(event) => {
                      setGame({
                          ...game,
                          baseGameId: event.target.value
                      });
                    }}
                  >
                    <option value="">Select base game</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name ?? "Unnamed game"}
                      </option>
                    ))}
                  </select>
                </div>)}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            {!mutation.isLoading ? (
              <Button
                disabled={mutation.isLoading}
                variant="primary"
                onClick={() => {
                  mutation.mutate(game);
                }}
              >
                Add custom game
              </Button>
            ) : (
              <LoadingSpinner size={30} />
            )}
              {mutation.isError && <div className="text-red-500">Something went wrong when saving the custom game</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MakeCustomGame;

