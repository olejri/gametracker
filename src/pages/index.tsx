import { useRouter } from "next/router";
import React from "react";
import type { NextPage } from "next";
import { LoadingPage } from "npm/components/loading";
import { api } from "npm/utils/api";

const Home: NextPage = () => {
  const { pathname, push } = useRouter();
  const { data } = api.group.getActiveGameGroup.useQuery();

  if (data?.groupId !== "" && data?.groupId !== undefined) {
    const url = `${data?.groupId}/dashboard/`;
    if (pathname == "/") {
      void push(url);
    }
  }
  return <LoadingPage />;
};

export default Home;
