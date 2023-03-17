import { useRouter } from "next/router";
import History from "npm/components/History";
import { DashboardChecker } from "npm/components/DashboardChecker";


const HistoryPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  const dashboardChecker = DashboardChecker(dashboardId);

  return <History groupName={dashboardId} />
};

export default HistoryPage;