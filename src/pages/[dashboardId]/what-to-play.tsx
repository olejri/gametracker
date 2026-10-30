import { useRouter } from "next/router";
import WhatToPlay from "npm/components/WhatToPlay";

const WhatToPlayPage = () => {
  const groupName = useRouter().query.dashboardId as string;
  return <WhatToPlay groupName={groupName} />;
};

export default WhatToPlayPage;
