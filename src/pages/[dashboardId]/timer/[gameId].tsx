import { useRouter } from "next/router";
import GameTimer from "npm/components/GameTimer";

const GameTimerPage = () => {
  const router = useRouter();
  const sessionId = router.query.gameId as string;
  const groupId = router.query.dashboardId as string;
  if (!sessionId || !groupId) return null;
  return <GameTimer groupId={groupId} sessionId={sessionId} />;
};

export default GameTimerPage;
