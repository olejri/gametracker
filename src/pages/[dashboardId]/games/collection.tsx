import GameCollections from "npm/components/GameCollections";
import { useRouter } from "next/router";


const GameCollectionsPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;

  return <GameCollections groupName={dashboardId} />;
}

export default GameCollectionsPage;