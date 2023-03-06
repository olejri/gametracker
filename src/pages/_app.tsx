import { type AppType } from "next/app";

import { api } from "npm/utils/api";

import "npm/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
