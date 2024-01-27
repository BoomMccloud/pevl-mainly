import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { kvStore } from "@/server/lib/kv/Persistence";
import { lottery } from "@/server/lib/LotteryService";
import { type ResponseTPRC } from "@/server/lib/LotteryTypes";

export const adminRouter = createTRPCRouter({
  /**
   * 初始化池
   */
  initPool: publicProcedure.mutation(async (): Promise<ResponseTPRC> => {
    try {
      const r1 = await kvStore.clean("LOTTERY*");
      await lottery.init();
      return { code: 200, message: "OK", result: r1 };
    } catch (error: unknown) {
      console.log("Admin tsx Error init", error);
      return { code: 500, message: "error" };
    }
  }),
});
