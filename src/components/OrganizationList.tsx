import { useOrganizationList } from "@clerk/nextjs";

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
        <ul>
          {organizationList.map(({ organization, membership }) => (
            <li key={organization.id}>
              <p>Name: {organization.name}</p>
              <p>Your role: {membership.role}</p>
              <button onClick={() => setActive(organization.id)}>Make active</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrganizationList;