import { useUser } from "@clerk/nextjs";

export const DashboardChecker = (slug: string) => {
  const clerk = useUser();

  if (!clerk.user) {
    return false;
  }
  const user = {
    slug: clerk.user?.organizationMemberships?.[0]?.organization.slug,
  };
  return slug === user.slug;
};
