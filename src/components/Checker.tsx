import { useUser } from "@clerk/nextjs";
import React, { type ReactNode } from "react";
import { useRouter } from "next/router";

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

    if (!clerk.user) {
      return <p>Not logged in!</p>;
    }
    //dev mode
    if (location.hostname === "localhost") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return <WrappedComponent {...props} />;
    }

    const slugs = clerk.user?.organizationMemberships?.map((org) => org.organization.slug ?? "");
    if (!slugs.includes(props.slug) && path.pathname !== "/") {
      return <p>Welcome to Game Tracker. Please ask for an invitation to access the dashboard for your group.</p>;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <WrappedComponent {...props} />;
  };
  return DashboardCheckerWrapper;
};
export default withDashboardChecker;