import type { User, OrganizationMembership } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  };
};

export const filterUserForClientWithOrg = (props: { organizationMembership: OrganizationMembership; user: User }) => {
  const { user, organizationMembership } = props;

  if (organizationMembership.organization.slug === undefined || organizationMembership.organization.slug === null) {
    throw new Error("Organization slug is undefined");
  }

  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    organizationSlug: organizationMembership.organization.slug
  };
};