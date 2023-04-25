import AdminView from "npm/components/Admin";
import { useRouter } from "next/router";

const AdminPage = () => {
  const router = useRouter();
  return <AdminView gameGroup={router.query.dashboardId as string} />;
};

export default AdminPage;