import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

const HighScoresPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  
  const { data: highScores, isLoading, isError } = api.stats.getGameHighScores.useQuery({
    groupId: dashboardId,
  });

  if (isLoading) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }

  if (isError || !highScores) {
    return <div className="text-center text-gray-500">No high scores available.</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-14">
      <h1 className="text-2xl font-bold text-center mb-6">Game High Scores</h1>
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  High Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highScores.map((game, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {game.gameName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {game.highScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.playerName}
                  </td>
                </tr>
              ))}
              {highScores.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No high scores available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HighScoresPage;
