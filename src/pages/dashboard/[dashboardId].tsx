import Dashboard from "npm/components/Dashboard";
import { useRouter } from "next/router";
import { useOrganizationList } from "@clerk/nextjs";


const DashboardPage = () => {
  const dashboardId = useRouter().query.dashboardId as string
  const { organizationList, isLoaded, setActive } = useOrganizationList();

  if (!isLoaded) {
    return (<></>)
  }
  if(dashboardId === undefined) return (<></>);

  const org = organizationList?.find(({ organization }) => {
    if (organization.slug === dashboardId) {
      return JSON.stringify(organization);
    }
    return null;
  });

  if(org) {
    console.log("Dashboard found: " + dashboardId)
    setActive({ organization: dashboardId }).catch(e => console.log(e));
    return (
      <Dashboard name={org.organization.name} slug={org.organization.slug ?? ""}/>
    )
  } else {
    return (<>
      <h1>Ask admin to get invited to {dashboardId}</h1>
    </>)
  }
}
export default DashboardPage;