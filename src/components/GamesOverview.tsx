import useFetch from "npm/lib/FetchFromAtlas";
import { useState } from "react";
import { type AtlasResponse, type CategoriesResponse, type AtlasGame, type MechanicsResponse } from "npm/components/Types";
import Image from 'next/image'
import { useRouter } from "next/navigation";


const GamesOverview = () => {
  const mechanismUrl = "https://api.boardgameatlas.com/api/game/mechanics?client_id=1rbEg28jEc";
  const categoryUrl = "https://api.boardgameatlas.com/api/game/categories?client_id=1rbEg28jEc";
  const router = useRouter();
  // const options: RequestInit = {
  //   method: "GET",
  //   mode: "no-cors",
  //   headers: {
  //     "Content-Type": "application/json" // The content type of the request body
  //   }
  // };


  const { data: mechanicsData, error: mechanicsError } = useFetch<MechanicsResponse>(mechanismUrl);
  const { data: categoriesData, error: categoriesError } = useFetch<CategoriesResponse>(categoryUrl);

  const [skip, setSkip] = useState(0);
  const [url, setUrl] = useState(`https://api.boardgameatlas.com/api/search?fields=name,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&skip=${skip}&limit=10}&client_id=1rbEg28jEc`);

  function handleLoadMore(forward: boolean) {
    if (forward) {
      setSkip(skip + 10);
    } else {
      setSkip(notLessThanZero(skip - 10));
    }
    setUrl(`https://api.boardgameatlas.com/api/search?fields=name,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&skip=${skip}&limit=10}&client_id=1rbEg28jEc`);
  }

  function notLessThanZero(value: number) {
    return value < 0 ? 0 : value;
  }

  const { data, error } = useFetch<AtlasResponse>(url);
  if (error || mechanicsError || categoriesError) return <p>There is an error.</p>;
  if (!data || !mechanicsData || !categoriesData) return <p>Loading...</p>;


  const games = data.games.map((game) => {
    const gameMechanics = game.mechanics.map((mechanic) => {
      return mechanicsData.mechanics.find((mechanicData) => mechanicData.id === mechanic.id)?.name ?? "Unknown";
    });
    const gameCategories = game.categories.map((category) => {
      return categoriesData.categories.find((categoryData) => categoryData.id === category.id)?.name ?? "Unknown";
    });
    return { ...game, mechanics: gameMechanics, categories: gameCategories };
  }) as unknown as AtlasGame[];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Game Data</h1>
      <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={() => router.push(`/`)}>
        Back to dashboard
      </button>
      <br/>
      <p>Current range is {skip} to {skip + 10}</p>
      <div className="grid grid-cols-24 gap-1">
        <button className="col-start-1 col-end-2 bg-gray-200 hover:bg-gray-300 rounded-full py-2 px-4"
                onClick={() => handleLoadMore(false)}
        >
          <svg className="h-5 w-5 text-gray-600 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
                  d="M10.707,4.293c0.391-0.391,1.023-0.391,1.414,0l4,4c0.391,0.391,0.391,1.023,0,1.414l-4,4c-0.391,0.391-1.023,0.391-1.414,0c-0.391-0.391-0.391-1.023,0-1.414L12.586,11H3c-0.552,0-1-0.448-1-1s0.448-1,1-1h9.586l-1.293-1.293C10.316,5.316,10.316,4.684,10.707,4.293z"></path>
          </svg>
        </button>
        <button className="col-start-2 col-end-3 bg-gray-200 hover:bg-gray-300 rounded-full py-2 px-4"
                onClick={() => handleLoadMore(true)}
        >
          <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
                  d="M10.707,4.293c0.391-0.391,1.023-0.391,1.414,0l4,4c0.391,0.391,0.391,1.023,0,1.414l-4,4c-0.391,0.391-1.023,0.391-1.414,0c-0.391-0.391-0.391-1.023,0-1.414L12.586,11H3c-0.552,0-1-0.448-1-1s0.448-1,1-1h9.586l-1.293-1.293C10.316,5.316,10.316,4.684,10.707,4.293z"></path>
          </svg>
        </button>
        <div className="col-start-3 col-span-12"></div>
      </div>



      <div className="overflow-x-auto">
        <table className="mt-4 w-full border-collapse">
          <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border border-gray-300 text-left">Name</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Image</th>
            <th className="py-2 px-4 border border-gray-300 text-center">Players</th>
            <th className="py-2 px-4 border border-gray-300 text-center">Minutes</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Mechanics</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Categories</th>
          </tr>
          </thead>
          <tbody>
          {games.map((game) => (
            <tr key={game.name} className="hover:bg-gray-50">
              <td className="py-2 px-4 border border-gray-300 text-left">{game.name}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{
                <div className="w-64 h-64">
                  <Image src={game.image_url} alt="My Image" width={200} height={200} />
                </div>
              }
              </td>

              <td className="py-2 px-4 border border-gray-300 text-center">{game.min_players}-{game.max_players}</td>
              <td className="py-2 px-4 border border-gray-300 text-center">{game.min_playtime}-{game.max_playtime}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{game.mechanics.join(", ")}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{game.categories.join(", ")}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GamesOverview;