import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { LoadingPage } from "npm/components/loading";
import React from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Home: NextPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { pathname, push } = useRouter();

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );
  }
  //show the greetings message based on the organization membership
  if (user.organizationMemberships && user.organizationMemberships.length == 1) {
    const slug = user.organizationMemberships[0]?.organization.slug

    if (slug === undefined || slug === null) {
      return (
        <div className="flex grow">
          <LoadingPage />
        </div>
      );
    }
    const url = `${slug}/dashboard/`;
    if (pathname == "/") {
      void push(url);
    }
  } else {
    if (location.hostname === "localhost") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      void push("/game-night/dashboard");
    } else {
      return (
        <>
          Welcome to Game Tracker. Please ask for an invitation to access the dashboard for your group.
        </>
      );
    }
  }
};

export default Home;
