import { type NextPage } from "next";
import Head from "next/head";

import { api } from "npm/utils/api";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const db = api.example.postExample.useQuery({
    id: "1", createdAt: new Date(), updatedAt: new Date()
  });

  const getData = api.example.getAll.useQuery()

  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn || !getData.isSuccess) {
    return null
  }

  const test = getData.data.map((item) => {
    return dayjs(item.createdAt).format("DD/MM/YYYY")
  })

  return (
    <>
      <Head>
        <title>Game Tracker</title>
      </Head>
      <main>
        <h1>Game Tracker</h1>
        <h2>Welcome user: {user.firstName}</h2>
        {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        {db.isSuccess ? "saved" : "not saved"}
        {getData.isSuccess ? getData.data.map((item) => <p key={item.id}>{test}</p>) : "not saved"}
      </main>
    </>
  );
};

export default Home;
