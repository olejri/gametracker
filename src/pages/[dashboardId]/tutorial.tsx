import { useRouter } from "next/router";
import Tutorial from "npm/components/Tutorial";

const TutorialPage = () => {
  const router = useRouter();
  const groupName = router.query.dashboardId as string;
  return <Tutorial groupName={groupName} />;
};

export default TutorialPage;
