import Dashboard from "npm/components/Dashboard";
import { useRouter } from "next/router";

const UserProfilePage = () => {
  const groupName = useRouter().query.dashboardId as string;
  return Dashboard(groupName)
}

export default UserProfilePage;