import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { lottery } from "@/server/lib/LotteryService";
import { type PoolType, type ResponseTPRC } from "@/server/lib/LotteryTypes";
import { InitPoolConfig } from "@/server/lib/PoolConfig";

export const poolRouter = createTRPCRouter({
  /**
   * 池子列表
   */
  poolList: publicProcedure.query(async (): Promise<ResponseTPRC> => {
    try {
      const poolRecord = InitPoolConfig;
      const poolList = new Array<PoolType>();
      for (const poolCode in poolRecord) {
        poolList.push(poolRecord[poolCode].prop);
      }
      return { code: 200, message: "OK", result: poolList };
    } catch (error: unknown) {
      console.log(error);
      return { code: 500, message: "error" };
    }
  }) /**
   * 池子带状态列表
   */,
  poolStateList: publicProcedure.query(async (): Promise<ResponseTPRC> => {
    try {
      const poolList = await lottery.poolState();
      return { code: 200, message: "OK", result: poolList };
    } catch (error: unknown) {
      console.log(error);
      return { code: 500, message: "error" };
    }
  }),
  /**
   * 开奖
   */
  runLottery: publicProcedure
    .input(z.object({ poolCode: z.string() }))
    .mutation(async ({ input }): Promise<ResponseTPRC> => {
      try {
        return { code: 200, message: "OK", result: input.poolCode };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),
});
