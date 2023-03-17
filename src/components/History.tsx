import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import Image from "next/image";
import dayjs from "dayjs";

const History = (props: DashboardProps) => {
  const newVar = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  })

  if (newVar.data !== undefined) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        {newVar.data.length === 0 && <p className="text-gray-500">No game history found</p>}
        {newVar.data.length > 0 &&
          newVar.data.map((session, i) => (
            <div key={i} className="mt-4 border-b pb-4">
              <p className="text-lg font-bold">Game: {session.gameName} -- Played at: {dayjs(session.updatedAt).format("DD-MM-YYYY")}</p>
              <Image src={session.image_url} alt="My Image" width={200} height={200} className="rounded-lg mt-4" />
              <ul className="mt-4">
                {session.players.map((player, j) => (
                  <li key={j} className="flex items-center">
                    <span className="font-bold">{player.nickname}</span> - Score: {player.score} - Position: {player.position}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    );
  } else {
    return <div className="text-center mt-4">Loading...</div>;
  }
};

export default History;
