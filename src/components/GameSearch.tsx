import useFetch from "npm/lib/FetchFromAtlas";
import { useState } from "react";
import { type AtlasResponse, type CategoriesResponse, type AtlasGame, type MechanicsResponse } from "npm/components/Types";
import Image from "next/image";
import { api } from "npm/utils/api";


const GameSearch = () => {
  const mechanismUrl = "https://api.boardgameatlas.com/api/game/mechanics?client_id=QWFcgdyEt7";
  const categoryUrl = "https://api.boardgameatlas.com/api/game/categories?client_id=QWFcgdyEt7";

  const { data: mechanicsData, error: mechanicsError } = useFetch<MechanicsResponse>(mechanismUrl);
  const { data: categoriesData, error: categoriesError } = useFetch<CategoriesResponse>(categoryUrl);

  const [url, setUrl] = useState("");
  const [searchName, setSearchName] = useState("");
  const [mechanic, setMechanic] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const { data: collections } = api.game.getAllGames.useQuery();
  const mutation = api.game.addGame.useMutation();


  function search(searchName: string, mechanic: string, category: string) {
    if (searchName.length === 0 && category.length === 0 && mechanic.length > 0) {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&mechanics=${mechanic}&client_id=QWFcgdyEt7`);
    } else if(searchName.length === 0 && mechanic.length === 0 && category.length > 0) {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&categories=${category}&client_id=QWFcgdyEt7`);
    } else if (searchName.length > 0 && mechanic.length === 0 && category.length === 0) {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&client_id=QWFcgdyEt7`);
    } else if (searchName.length === 0 && mechanic.length> 0 && category.length > 0) {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&mechanics=${mechanic}&categories=${category}&client_id=QWFcgdyEt7`);
    } else if (searchName.length > 0 && mechanic.length === 0 && category.length > 0) {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&categories=${category}&client_id=QWFcgdyEt7`);
    } else if (searchName.length > 0 && mechanic.length > 0 && category.length === 0) {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&mechanics=${mechanic}&client_id=QWFcgdyEt7`);
    } else {
      setUrl(`https://api.boardgameatlas.com/api/search?fields=name,description,image_url,min_players,max_players,min_playtime,max_playtime,mechanics,categories&fuzzy_match=true&name=${searchName}&mechanics=${mechanic}&categories=${category}&client_id=QWFcgdyEt7`)
    }
  }

  const { data, error, loading } = useFetch<AtlasResponse>(url);
  if (error || mechanicsError || categoriesError) return <p>There is an error.</p>;
  if (!mechanicsData || !categoriesData || loading || !collections) return <p>Loading...</p>;

  if (!data) return (
    <div>
      <h1 className="text-xl font-bold mb-4">Game Data</h1>
      <input className="border border-gray-300 rounded py-2 px-4" type="text" placeholder="Name of the game"
             onChange={(e) => setSearchName(e.target.value)} />
      <select
        value={mechanic}
        onChange={(event) => {
          setMechanic(event.target.value);
        }}
      >
        <option value="">Select a mechanic</option>
        {mechanicsData.mechanics.map((mechanic) => (
          <option key={mechanic.id} value={mechanic.id}>
            {mechanic.name ?? "Unnamed mechanic"}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(event) => {
          setCategory(event.target.value);
      }}>
        <option value="">Select a category</option>
        {categoriesData.categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name ?? "Unnamed category"}
          </option>
        ))}
      </select>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => search(searchName, mechanic, category)}>Search
      </button>
    </div>
  );

  const games = data.games.map((game) => {
    const gameMechanics = game.mechanics.map((mechanic) => {
      return mechanicsData.mechanics.find((mechanicData) => mechanicData.id === mechanic.id)?.name ?? "Unknown";
    });
    const gameCategories = game.categories.map((category) => {
      return categoriesData.categories.find((categoryData) => categoryData.id === category.id)?.name ?? "Unknown";
    });
    return { ...game, mechanics: gameMechanics, categories: gameCategories };
  }) as unknown as AtlasGame[];

  const isGameInCollection = (game: AtlasGame) => {
    return collections.games.some((collection) => collection.name === game.name);
  }

  return (
    <div>
      <div>
        <h1 className="text-xl font-bold mb-4">Game Data</h1>
        <input className="border border-gray-300 rounded py-2 px-4" type="text" placeholder="Name of the game"
               value={searchName}
               onChange={(e) => setSearchName(e.target.value)} />
        <select
          value={mechanic}
          onChange={(event) => {
            setMechanic(event.target.value);
          }}
        >
          <option value="">Select a mechanic</option>
          {mechanicsData.mechanics.map((mechanic) => (
            <option key={mechanic.id} value={mechanic.id}>
              {mechanic.name ?? "Unnamed mechanic"}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
          }}>
          <option value="">Select a category</option>
          {categoriesData.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name ?? "Unnamed category"}
            </option>
          ))}
        </select>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => search(searchName, mechanic, category)}>Search
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full border-collapse">
          <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border border-gray-300 text-left">Name</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Image</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Description</th>
            <th className="py-2 px-4 border border-gray-300 text-center">Players</th>
            <th className="py-2 px-4 border border-gray-300 text-center">Minutes</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Mechanics</th>
            <th className="py-2 px-4 border border-gray-300 text-left">Categories</th>
          </tr>
          </thead>
          <tbody>
          {games.map((game) => (
            <tr key={game.name} className="hover:bg-gray-50">
              <td className="py-2 px-4 border border-gray-300 text-left">
                {game.name}
                {isGameInCollection(game) ? <span className="ml-2 text-green-500">In collection</span>
                  : <button className={"ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}
                  onClick={ (event) => {
                    event.preventDefault();
                    mutation.mutate( {
                      data: {
                        ...game,
                        players: `${game.min_players}-${game.max_players}`,
                        playtime: `${game.min_playtime}-${game.max_playtime}`,
                        mechanics: game.mechanics.join(", "),
                        categories: game.categories.join(", ")
                      }
                    })
                  }
                }>Add game to collection</button>}
              </td>
              <td className="py-2 px-4 border border-gray-300 text-left">{
                <div className="w-64 h-64">
                  <Image src={game.image_url} alt="My Image" width={200} height={200} />
                </div>
              }
              </td>
              <td className="py-2 px-4 border border-gray-300 text-center">{<div dangerouslySetInnerHTML={{ __html: game.description }} />}</td>
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

export default GameSearch;