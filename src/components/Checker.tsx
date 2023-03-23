import { OrganizationSwitcher, useUser } from "@clerk/nextjs";
import React, { type ReactNode } from "react";
import { useRouter } from "next/router";
import { useOrganizationContext } from "@clerk/shared";

interface Props {
  slug: string;
  children: ReactNode;
}

const withDashboardChecker = () => (
  WrappedComponent: React.ComponentType
) => {
  const DashboardCheckerWrapper = (props: Props) => {
    const clerk = useUser();
    const path = useRouter();
    const org = useOrganizationContext();

    if (!clerk.user) {
      return <p>Not logged in!</p>;
    }

    if(org.organization === null || org.organization === undefined) {
      return <OrganizationSwitcher/>
    }

    const slugs = clerk.user?.organizationMemberships?.map((org) => org.organization.slug ?? "")
    if (!slugs.includes(props.slug) && path.pathname !== "/") {
      return <p>Ask admin for an invite! :D</p>;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <WrappedComponent {...props} />;
  };
  return DashboardCheckerWrapper;
};
export default withDashboardChecker;