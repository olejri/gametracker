import React from "react";
import { OrganizationSwitcher } from "@clerk/nextjs";

const SwitchOrg = () => {
  return (
    <OrganizationSwitcher
      hidePersonal={true}
      afterSwitchOrganizationUrl="/"
      createOrganizationMode={"navigation"}
      createOrganizationUrl={"/"}
    />
  );
};

export default SwitchOrg;