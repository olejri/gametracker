import ExportView from "npm/components/Export";
import { useRouter } from "next/router";
const Export = () => {
  const router = useRouter();
  const groupName = router.query.dashboardId as string;
  return <ExportView groupName={groupName}/>;
};

export default Export;