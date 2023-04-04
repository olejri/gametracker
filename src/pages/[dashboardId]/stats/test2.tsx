import { useRouter } from "next/router";
import Test2 from "npm/components/graph2";


const TestPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return <Test2 groupName={dashboardId} />;
};

export default TestPage;