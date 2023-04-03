import { useRouter } from "next/router";
import Test from "npm/components/graph";


const TestPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return <Test groupName={dashboardId} />;
};

export default TestPage;