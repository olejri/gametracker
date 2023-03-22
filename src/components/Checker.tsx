import { useUser } from "@clerk/nextjs";
import React, { type ReactNode } from "react";

interface Props {
  slug: string;
  children: ReactNode;
}

const withDashboardChecker = () => (
  WrappedComponent: React.ComponentType
) => {
  const DashboardCheckerWrapper = (props: Props) => {
    const clerk = useUser();
    if (!clerk.user) {
      return <p>Not logged in!</p>;
    }
    const slugs = clerk.user?.organizationMemberships?.map((org) => org.organization.slug ?? "")
    if (!slugs.includes(props.slug)) {
      return <p>Ask admin for an invite! :D</p>;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <WrappedComponent {...props} />;
  };
  return DashboardCheckerWrapper;
};
export default withDashboardChecker;