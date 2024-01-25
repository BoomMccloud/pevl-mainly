import { MD5 } from "crypto-js";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { kvStore } from "@/server/lib/kv/Persistence";
import {
  ConstantField,
  ConstantKey,
  lottery,
  type MyTicketType,
  type PhaseResult,
  type PoolType,
  type ResponseTPRC,
  type TicketType,
} from "@/server/lib/LotteryService";

export const userRouter = createTRPCRouter({
  getReferral: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }): Promise<ResponseTPRC> => {
      try {
        const code = MD5(input.address).toString();
        const points = await kvStore.get(
          lottery.getUserNamespace(input.address),
          ConstantField.USER_POINT_SUM_FIELD,
        );
        const refPoints = await kvStore.get(
          lottery.getUserNamespace(input.address),
          ConstantField.USER_REF_POINT_SUM_FIELD,
        );
        const refNum = await kvStore.get(
          lottery.getUserNamespace(input.address),
          ConstantField.USER_REF_TO_COUNT_FIELD,
        );
        await kvStore.saveNx(ConstantKey.LOTTERY_REFERRAL_TO_USER, code, input.address);
        return { code: 200, message: "OK", result: { code, points, refPoints, refNum } };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),

  saveTickets: publicProcedure
    .input(
      z.object({
        address: z.string(),
        txHash: z.string(),
        poolCode: z.string(),
        txTime: z.number(),
        ticketNum: z.optional(z.number().default(1)),
        tickets: z.optional(z.array(z.string())),
        referral: z.optional(z.string()),
      }),
    )
    .mutation(async ({ input }): Promise<ResponseTPRC> => {
      try {
        const tickets: string[] = [];
        for (let i = 0; i < (input.ticketNum ?? 1); i++) {
          tickets.push(lottery.randomHex());
        }

        const r = await lottery.createTicket(
          {
            address: input.address,
            txHash: input.txHash,
            tickets,
            txTime: input.txTime,
            poolCode: input.poolCode,
            currentPhase: "No start",
          },
          input.referral,
        );
        return { code: 200, message: "OK", result: r };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),
  ticketsList: publicProcedure
    .input(
      z.object({
        address: z.string(),
        page: z.optional(z.object({ start: z.number(), size: z.number() })),
      }),
    )
    .query(async ({ input }): Promise<ResponseTPRC> => {
      try {
        const poolMap = await kvStore.list(ConstantKey.LOTTERY_POOLS);
        const r = (await kvStore.list(lottery.getUserNamespace(input.address))) as Record<
          string,
          TicketType
        >;
        const phaseMap: Record<string, MyTicketType> = {};
        for (const ticketTx in r) {
          if (ticketTx.startsWith("USER_")) {
            continue;
          }
          const currentPhase = r[ticketTx].currentPhase;
          let obj = phaseMap[currentPhase];
          if (!obj) {
            //当前期总票数
            const phaseTicketCount = (await kvStore.get(
              currentPhase,
              ConstantField.PHASE_TICKET_COUNT_FIELD,
            )) as number;
            const result = (await kvStore.get(
              currentPhase,
              ConstantField.PHASE_RESULT_FIELD,
            )) as PhaseResult;
            const txList: TicketType[] = [];
            const ticketCount = 0;
            const isWon = undefined;
            const pool = poolMap[r[ticketTx].poolCode] as PoolType;
            obj = { currentPhase, phaseTicketCount, ticketCount, result, txList, isWon, pool };
          }
          const { txList, result } = obj;
          txList.push(r[ticketTx]);
          obj.ticketCount += r[ticketTx].tickets.length;
          obj.isWon = Boolean(result) && result.hitAddr && result.hitAddr.includes(input.address);
          phaseMap[currentPhase] = obj;
        }
        return { code: 200, message: "OK", result: phaseMap };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),
});
