import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/router";

const OrganizationList = () => {
  const { organizationList, isLoaded } = useOrganizationList();
  const { push } = useRouter();

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
        organizationList.length > 1 ? (
        <ul>
          {organizationList.map(({ organization, membership }) => (
            <li key={organization.id}>
              <p>Name: {organization.name}</p>
              <p>Your role: {membership.role}</p>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */}
              <button onClick={() => {void push(`/dashboard/${organization?.slug}`).then(r => console.log(r));}}>Go to dashboard</button>
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