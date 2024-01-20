import { adminRouter } from "@/server/api/routers/admin";
import { poolRouter } from "@/server/api/routers/pool";
import { userRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  user: userRouter,
  pool: poolRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;