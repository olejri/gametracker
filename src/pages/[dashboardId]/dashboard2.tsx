import Example from "npm/components/Dashboard2";
import { useRouter } from "next/router";

const UserProfilePage = () => {
  const groupName = useRouter().query.dashboardId as string;
  return Example(groupName)
}

export default UserProfilePage;