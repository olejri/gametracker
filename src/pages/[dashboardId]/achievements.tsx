import { useRouter } from "next/router";
import MyAchievements from "npm/components/MyAchievements";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

const AchievementsPage = () => {
  const router = useRouter();
  const groupName = router.query.dashboardId as string;
  const { data, isLoading, isError, error } = api.group.getAllGameGroups.useQuery();

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <p>{error?.message}</p>;
  }
  if (!data.map((g) => g.id).includes(groupName)) {
    void router.push("/");
  }
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <MyAchievements groupName={groupName} />
    </div>
  );
};

export default AchievementsPage;
