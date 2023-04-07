import { useRouter } from "next/router";
import PlayerBoard from "npm/components/PlayerBoard";

const PlayerBoardPage = () => {
  const playerId = useRouter().query.playerId as string;
  const groupId = useRouter().query.dashboardId as string;
  return (<PlayerBoard groupName={groupId} playerId={playerId}/>)
};

export default PlayerBoardPage;