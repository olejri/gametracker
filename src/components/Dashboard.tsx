import React from "react";
import Head from "next/head";
import { DashboardProps } from "npm/components/Types";

const Dashboard = (props: DashboardProps) => {
  return (
    <>
      <Head>
        <title>Game Tracker</title>
      </Head>
      <main>
        <h1>{props.name}</h1>
      </main>
</>
  )
};

export default Dashboard;