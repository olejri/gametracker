import React from "react";
import { OrganizationSwitcher } from "@clerk/nextjs";

const SwitchOrg = () => {
  return (
    <OrganizationSwitcher
      hidePersonal={true}
      afterSwitchOrganizationUrl="/"
    />
  );
};

export default SwitchOrg;