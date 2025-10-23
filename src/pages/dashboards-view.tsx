import type { NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { LoadingPage } from "npm/components/loading";
import SuperAdminView from "npm/components/SuperAdmin";
import { api } from "npm/utils/api";

const DashboardsView: NextPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { data: playerData, isLoading: playerLoading } = api.user.getPlayer.useQuery(
    { clerkId: user?.id || "" },
    { enabled: !!user?.id }
  );

  if (!isLoaded || playerLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    void router.push("/");
    return <LoadingPage />;
  }

  // Check if user is superadmin
  if (!playerData?.data?.isSuperAdmin) {
    void router.push("/");
    return <LoadingPage />;
  }

  return <SuperAdminView />;
};

export default DashboardsView;
