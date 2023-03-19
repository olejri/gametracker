import { type DashboardProps } from "npm/components/Types";
import { api } from "npm/utils/api";
import Image from "next/image";
import dayjs from "dayjs";

const History = (props: DashboardProps) => {
  const newVar = api.session.getAllCompletedSessions.useQuery({
    data: {
      groupId: props.groupName
    }
  });

  if (newVar.data !== undefined) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        {newVar.data.length === 0 && <p className="text-gray-500">No game history found</p>}
        {newVar.data.length > 0 &&
          newVar.data.map((session, i) => (
            <div key={i} className="mt-4 border-b pb-4">
              <p className="text-lg font-bold">{session.gameName}</p>
              <p>Session played at: {dayjs(session.updatedAt).format("DD.MM.YYYY")}</p>
              <p>Status: {session.status}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0">
                <div className={""}>
                  <Image src={session.image_url} alt="My Image" width={400} height={300} className="rounded-lg mt-4" />
                </div>
                {session.expansions.map((expansion, j) =>
                <div className={""} key={j} >
                  <Image src={expansion.image_url} alt="My Image" width={400} height={300} className="rounded-lg mt-4" />
                </div>
                )}
                <div className={"order-last"}></div>
              </div>
              <ul className="mt-4">
                {session.players.sort((a, b)=> a.position - b.position).map((player, j) => (
                  <li key={j} className="flex items-center">
                    <span className="font-bold">{player.nickname + " "}</span>: Score: {player.score} -
                    Position: {player.position}
                  </li>
                ))}
              </ul>
              <div>
                <p className="text-lg font-bold">Additional info:</p>
                <textarea className="">{session.description}</textarea>
              </div>
            </div>
          ))}
      </div>
    );
  } else {
    return <div className="text-center mt-4">Loading...</div>;
  }
};

export default History;
