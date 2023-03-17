import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import Image from "next/image";

const History = (props: DashboardProps) => {
  const newVar = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  })

  if (newVar.data !== undefined) {
  return (
    <div>
      {newVar.data.length === 0 && <p>No game history found</p>}
      {newVar.data.length > 0 &&
        newVar.data.map((session, i) => (
          <div key={i}>
            <p>Game name: {session.gameName}</p>
            <Image src={session.image_url} alt="My Image" width={200} height={200} />
            <ul>
              {session.players.map((player, j) => (
                <li key={j}>
                  {player.nickname} - Score: {player.score} - Position: {player.position}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
  } else {
    return <div>Loading...</div>;
  }
};

export default History;