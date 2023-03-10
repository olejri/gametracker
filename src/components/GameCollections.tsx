import { api } from "npm/utils/api";
import Image from "next/image";
import { useState } from "react";

const GameCollections = () => {

  const { data } = api.game.getAllGames.useQuery();
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const toggleExpandedGame = (gameName: string) => {
    if (expandedGame === gameName) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameName);
    }
  };

  const getShortenedDescription = (description: string) => {
    return description.substring(0, 300) + " ...";
  };


  if (!data) return <p>Loading...</p>;

  const games = data.games;

  return (
    <div>
      <div>
        <h1 className="text-xl font-bold mb-4">Game Collection</h1>
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
              </td>
              <td className="py-2 px-4 border border-gray-300 text-left">{
                <div className="w-64 h-64">
                  <Image src={game.image_url} alt="My Image" width={200} height={200} />
                </div>
              }
              </td>
              <td
                className="py-2 px-4 border border-gray-300 text-center cursor-pointer"
                onClick={() => toggleExpandedGame(game.name)}
              >
                {expandedGame === game.name
                  ? <div dangerouslySetInnerHTML={{ __html: game.description }} />
                  : <div dangerouslySetInnerHTML={{ __html: getShortenedDescription(game.description) }} />}
              </td>
              <td className="py-2 px-4 border border-gray-300 text-center">{game.players}</td>
              <td className="py-2 px-4 border border-gray-300 text-center">{game.playtime}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{game.mechanics}</td>
              <td className="py-2 px-4 border border-gray-300 text-left">{game.categories}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  )
};

export default GameCollections;