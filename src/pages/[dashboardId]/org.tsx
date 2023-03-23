import { OrganizationProfile } from "@clerk/nextjs";

const OrgPage = () => (
  <OrganizationProfile path="/org" routing="path" />
);

export default OrgPage;