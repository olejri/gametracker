import { type NextPage } from "next";
import Head from "next/head";
import { useUser } from "@clerk/nextjs";
import { type DataFromClerk } from "npm/components/Types";


const Home: NextPage = () => {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn || !user) {
    return null
  }


 //show the greetings message based on the organization membership
  if (user.organizationMemberships && user.organizationMemberships.length == 1) {

    const data = user.organizationMemberships[0]?.organization.publicMetadata;
    const data1 = data as unknown as DataFromClerk;

    if (data === undefined) {
      return null
    }

    return (
      <>
        <Head>
          <title>Game Tracker</title>
        </Head>
        <main>
          <h1>Dashboard</h1>
          <h2>Welcome user: {user.firstName}</h2>
          <div>Welcome to {data1.name}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Game Tracker</title>
      </Head>
      <main>
        <h1>Game Tracker</h1>
        <h2>Welcome user: {user.firstName}</h2>

      </main>
    </>
  );
};

export default Home;
