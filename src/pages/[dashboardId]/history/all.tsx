import { useRouter } from "next/router";
import History from "npm/components/History";


const HistoryPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return <History groupName={dashboardId} />;
};

export default HistoryPage;