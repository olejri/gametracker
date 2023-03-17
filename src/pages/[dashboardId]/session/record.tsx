import RecordSession from "npm/components/RecordSession";
import { useRouter } from "next/router";


const RecordSessionPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return (<RecordSession groupName={dashboardId} />)

};


export default RecordSessionPage;