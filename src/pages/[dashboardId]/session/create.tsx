import { useRouter } from "next/router";
import StartNewGame from "npm/components/StartNewGame";


const CreateSessionPage = () => {
  const dashboardId = useRouter().query.dashboardId as string;
  return (<StartNewGame groupName={dashboardId} />)

};

export default CreateSessionPage;