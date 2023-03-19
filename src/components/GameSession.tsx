import { type GameSessionProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import Image from "next/image";

const GameSession = (props: GameSessionProps) => {
  const getPlayers = api.player.getPlayers.useQuery({
    groupId: props.groupName
  });

  const result = api.session.getGameASession.useQuery({
    data: {
      id: props.gameId
    }
  });

  if (result.data !== undefined && getPlayers.data !== undefined) {
    const session = result.data.data;
    const players = getPlayers.data.data;
    if (session === null) {
      return <div className="text-center mt-4">No session found</div>;
    }
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">{session.gameName}</h1>
        <Image src={session.image_url} alt="My Image" width={400} height={300} className="rounded-lg mt-4" />
        <p className="my-4">{session.description}</p>
        <h2 className="text-xl font-bold mb-2">Players:</h2>
        <ul className="list-disc ml-6">
          {session.players.map((player) => (
            <li key={player.playerId}>
              {player.nickname} ({player.score})
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-bold my-4">Expansions:</h2>
        <ul className="list-disc ml-6">
          {session.expansions.map((expansion) => (
            <li key={expansion.gameId}>
              {expansion.gameName} ({expansion.image_url})
            </li>
          ))}
        </ul>
        <div>
          <select className="border border-gray-300 rounded-lg p-2">
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.nickname}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  } else {
    return <div className="text-center mt-4">Loading...</div>;
  }
};
export default GameSession;
