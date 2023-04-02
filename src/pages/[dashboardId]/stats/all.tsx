import { useRouter } from "next/router";
import Stats from "npm/components/Stats";


const StatsPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return <Stats groupName={dashboardId} />;
};

export default StatsPage;