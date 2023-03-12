import { useOrganizationList } from "@clerk/nextjs";
import { log } from "next/dist/server/typescript/utils";

const OrganizationList = () => {
  const { organizationList, isLoaded, setActive } = useOrganizationList();

  if (!isLoaded) {
    // show loading state
    return null;
  }

  return (
    <div>
      <h2>Your organizations</h2>
      {organizationList.length === 0 ? (
        <div>You do not belong to any organizations yet.</div>
      ) : (
        organizationList.length === 1 ? (
        <ul>
          {organizationList.map(({ organization, membership }) => (
            <li key={organization.id}>
              <p>Name: {organization.name}</p>
              <p>Your role: {membership.role}</p>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */}
              <button onClick={() => {setActive({ organization: organization.id }).catch(e => log(e))}}>Make active</button>
            </li>
          ))}
        </ul>
      ) : (
        <div>Error</div>
        ))}
    </div>
  );
};

export default OrganizationList;