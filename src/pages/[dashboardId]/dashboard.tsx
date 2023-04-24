import Dashboard from "npm/components/Dashboard";
import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

const UserProfilePage = () => {
  const router = useRouter();
  const groupName = router.query.dashboardId as string;
  const { data, isLoading, isError, error } = api.group.getAllGameGroups.useQuery();

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <p>{error?.message}</p>;
  }
  //check if groupName is valid
  if (!data.map((g) => g.id).includes(groupName)) {
    void router.push("/");
  }
  return Dashboard(groupName);
};

export default UserProfilePage;