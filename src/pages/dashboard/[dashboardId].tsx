import { useRouter } from "next/router";
import Dashboard from "npm/components/Dashboard";


const DashboardPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return (<Dashboard id={dashboardId} />)

};
export default DashboardPage;