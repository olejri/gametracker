import React, { type ReactNode } from "react";
import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";
import { useUser } from "@clerk/nextjs";

interface Props {
  slug: string;
  children: ReactNode;
}

const withDashboardChecker = () => (
  WrappedComponent: React.ComponentType
) => {
  const DashboardCheckerWrapper = (props: Props) => {
    api.user.getClerkUser.useQuery();

    const clerk = useUser();
    const path = useRouter();

    if (location.hostname === "localhost") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return <WrappedComponent {...props} />;
    }

    if (clerk.isLoaded && !clerk.user) {
      return (
        <div className="flex grow">
          <LoadingPage />
        </div>
      );
    }

    const slugs = clerk.user?.organizationMemberships?.map((org) => org.organization.slug ?? "") ?? [];
    if (props.slug === undefined || !slugs.includes(props.slug) && path.pathname !== "/") {
      return <p>Ask admin for an invite! :D</p>;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <WrappedComponent {...props} />;
  };
  return DashboardCheckerWrapper;
};
export default withDashboardChecker;