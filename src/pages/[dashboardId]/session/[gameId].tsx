import { useRouter } from "next/router";
import GameSession from "npm/components/GameSession";


const GameSessionPage = () => {
  const gameId = useRouter().query.gameId as string;
  const groupId = useRouter().query.dashboardId as string;
  return (<GameSession groupName={groupId} gameId={gameId} />)
};


export default GameSessionPage;