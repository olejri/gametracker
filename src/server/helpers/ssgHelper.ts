import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import superjson from "superjson";
import { prisma } from "npm/server/db";
import { appRouter } from "npm/server/api/root";

export const generateSSGHelper = () =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });