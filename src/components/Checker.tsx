import React, { type ReactNode } from "react";
import { useRouter } from "next/router";
import { api } from "npm/utils/api";
import { LoadingPage } from "npm/components/loading";

interface Props {
  slug: string;
  children: ReactNode;
}

const withDashboardChecker = () => (
  WrappedComponent: React.ComponentType
) => {
  const DashboardCheckerWrapper = (props: Props) => {
    const {data: userData, isLoading: userIsLoading, error, isError} = api.user.getClerkUser.useQuery();
    const path = useRouter();

    if (userIsLoading) {
      return (
        <div className="flex grow">
          <LoadingPage />
        </div>
      );
    }
    if(isError) {
      return <p>{error?.message}</p>;
    }

    if (userData.id === undefined) {
      return <p>Not logged in!</p>;
    }
    //dev mode
    if (location.hostname === "localhost") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return <WrappedComponent {...props} />;
    }

    if (props.slug !== userData.organizationSlug && path.pathname !== "/") {
      return <p>Welcome to Game Tracker. Please ask for an invitation to access the dashboard for your group.</p>;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <WrappedComponent {...props} />;
  };
  return DashboardCheckerWrapper;
};
export default withDashboardChecker;