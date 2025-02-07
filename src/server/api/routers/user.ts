import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { kvStore } from "@/server/lib/kv/Persistence";
import { ConstantField, lottery } from "@/server/lib/LotteryService";
import {
  type MyTicketType,
  type PhaseResult,
  type ResponseTPRC,
  type TicketType,
} from "@/server/lib/LotteryTypes";
import { InitPoolConfig } from "@/server/lib/PoolConfig";

export const userRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(z.object({ address: z.string().nullable(), referral: z.optional(z.string()) }))
    .query(async ({ input }): Promise<ResponseTPRC> => {
      try {
        await lottery.signIn(input.address, input.referral);
        return { code: 200, message: "OK" };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),

  getReferral: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }): Promise<ResponseTPRC> => {
      try {
        const r = await lottery.referralInfo(input.address);
        return { code: 200, message: "OK", result: r };
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
      }),
    )
    .mutation(async ({ input }): Promise<ResponseTPRC> => {
      try {
        const tickets: string[] = [];
        for (let i = 0; i < (input.ticketNum ?? 1); i++) {
          tickets.push(lottery.randomHex());
        }

        const r = await lottery.createTicket({
          address: input.address,
          txHash: input.txHash,
          tickets,
          txTime: input.txTime,
          poolCode: input.poolCode,
          currentPhase: "No start",
        });
        return { code: 200, message: "OK", result: r };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),
  claimPrize: publicProcedure
    .input(z.object({ address: z.string(), phase: z.string() }))
    .mutation(async ({ input }): Promise<ResponseTPRC> => {
      try {
        const txHash = await lottery.claimPrize(input.address, input.phase);
        return { code: 200, message: "OK", result: txHash };
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
        const poolRecord = InitPoolConfig;
        const r = await kvStore.list(lottery.getUserNamespace(input.address));
        const phaseMap: Record<string, MyTicketType> = {};
        for (const ticketTx in r) {
          if (ticketTx.startsWith("_FIELD_")) {
            continue;
          }
          const ticket = JSON.parse(r[ticketTx]) as TicketType;
          const currentPhase = ticket.currentPhase;
          let obj = phaseMap[currentPhase];
          if (!obj) {
            //当前期总票数
            const phaseTicketCountStr = await kvStore.get(
              currentPhase,
              ConstantField.PHASE_TICKET_COUNT_FIELD,
            );
            const phaseTicketCount =
              phaseTicketCountStr != null ? parseInt(phaseTicketCountStr) : 0;
            const resultStr = await kvStore.get(currentPhase, ConstantField.PHASE_RESULT_FIELD);
            const result = resultStr != null ? (JSON.parse(resultStr) as PhaseResult) : undefined;
            const txList: TicketType[] = [];
            const ticketCount = 0;
            const isWon = undefined;
            const pool = poolRecord[ticket.poolCode].prop;
            obj = { currentPhase, phaseTicketCount, ticketCount, result, txList, isWon, pool };
          }
          const { txList, result } = obj;
          txList.push(ticket);
          obj.ticketCount += ticket.tickets.length;
          if (result) {
            obj.isWon = result.hitAddr != undefined && result.hitAddr.includes(input.address);
          }
          phaseMap[currentPhase] = obj;
        }
        return { code: 200, message: "OK", result: phaseMap };
      } catch (error: unknown) {
        console.log(error);
        return { code: 500, message: "error" };
      }
    }),
});
