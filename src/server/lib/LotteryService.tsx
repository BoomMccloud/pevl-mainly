import "server-only";
import type Redis from "ioredis";
import moment from "moment";

import { kvStore } from "@/server/lib/kv/Persistence";

type ResponseTPRC = {
  code: number;
  message: string;
  result?: object | string | number | boolean | undefined;
};

enum Difficulty {
  MATCH = "MATCH",
  CLOSEST = "CLOSEST",
}

type PoolStateType = {
  pool: PoolType;
  currentPhase: PhaseResult | undefined;
  lastPhase: PhaseResult | undefined;
};
/**
 * 抽奖的参数
 * 名称，难度系数，周期（多少个区块）
 */
type PoolType = {
  poolCode: string;
  name: string;
  difficulty: Difficulty;
  period: string;
  price: number;
  prize: number;
};

type MyTicketType = {
  currentPhase: string;
  phaseTicketCount: number;
  ticketCount: number;
  result: PhaseResult | undefined;
  txList: TicketType[];
  isWon: boolean | undefined;
  pool: PoolType;
};

type TicketType = {
  poolCode: string;
  address: string;
  txHash: string;
  txTime: number;
  tickets: Array<string>;
  currentPhase: string;
};

type PhaseResult = {
  poolCode: string;
  currentPhase: string;
  ticketCount: number;
  lotteryResult: string | undefined;
  hitTx: string | undefined;
  hitAddr: string[] | undefined;
  hitTicket: string | undefined;
};

type LotteryPointType = {
  code: string;
  points: number;
  refPoints: number;
  refNum: number;
};

enum ConstantKey {
  //所有池信息
  LOTTERY_POOLS = "LOTTERY_POOLS",
  //当前期code
  LOTTERY_CURRENT_PHASE = "LOTTERY_CURRENT_PHASE",
  //最近期code
  LOTTERY_LAST_PHASE = "LOTTERY_LAST_PHASE",
  //code对应的用户
  LOTTERY_REFERRAL_TO_USER = "LOTTERY_REFERRAL_TO_USER",
}

enum ConstantField {
  //每期开奖结果
  PHASE_RESULT_FIELD = "PHASE_RESULT",
  //票证总数
  PHASE_TICKET_COUNT_FIELD = "PHASE_TICKET_COUNT",
  //自己积分总数
  USER_POINT_SUM_FIELD = "USER_POINT_SUM",
  //别人帮我积分
  USER_REF_POINT_SUM_FIELD = "USER_REF_POINT_SUM",
  //推荐了多少人
  USER_REF_TO_COUNT_FIELD = "USER_REF_TO_COUNT",
  //我的推荐人
  USER_REF_CODE = "USER_REF_CODE",
}

class LotteryService {
  kv: Redis;

  constructor() {
    this.kv = kvStore.getClient() as Redis;
  }

  async poolState() {
    const poolRecord = await this.kv.hgetall(ConstantKey.LOTTERY_POOLS);
    const currentPhaseKeyRecord = await this.kv.hgetall(ConstantKey.LOTTERY_CURRENT_PHASE);
    const lastPhaseKeyRecord = await this.kv.hgetall(ConstantKey.LOTTERY_LAST_PHASE);

    const poolList = new Array<PoolStateType>();
    for (const poolCode in poolRecord) {
      const pool = { ...(JSON.parse(poolRecord[poolCode]) as PoolType) };
      //####
      const currentKey = currentPhaseKeyRecord && (currentPhaseKeyRecord[poolCode] as string);
      const ticketCount =
        currentKey && (await this.kv.hget(currentKey, ConstantField.PHASE_TICKET_COUNT_FIELD));
      //###
      const lastPhaseKey = lastPhaseKeyRecord && (lastPhaseKeyRecord[poolCode] as string);
      const lastPhase =
        lastPhaseKey && (await this.kv.hget(lastPhaseKey, ConstantField.PHASE_RESULT_FIELD));
      //##
      const poolState: PoolStateType = {
        pool,
        lastPhase: lastPhase ? (JSON.parse(lastPhase) as PhaseResult) : undefined,
        currentPhase: {
          poolCode,
          ticketCount: ticketCount != null ? parseInt(ticketCount) : 0,
          currentPhase: currentKey ?? "No Start",
          lotteryResult: undefined,
          hitTicket: undefined,
          hitAddr: undefined,
          hitTx: undefined,
        },
      };
      poolList.push(poolState);
    }
    return poolList;
  }

  async phaseLottery(poolCode: string, lotteryResult: string) {
    await this.__startNewPhase(poolCode);
    const currentPhase = await this.kv.hget(ConstantKey.LOTTERY_LAST_PHASE, poolCode);

    // 摇奖对比,获取池信息
    const pool = await this.kv.hget(ConstantKey.LOTTERY_POOLS, poolCode);
    //获取当前所有用户信息<txHash:
    const phaseTickets = await this.kv.hgetall(currentPhase as string);

    //准备数据
    const ticketAndTxMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    const txAndAddressMap: Map<string, string> = new Map<string, string>();
    if (!pool || !phaseTickets) {
      return;
    }
    for (const txHash in phaseTickets) {
      if (txHash.startsWith("PHASE_")) {
        continue;
      }
      const ticket = JSON.parse(phaseTickets[txHash]) as TicketType;
      txAndAddressMap.set(txHash, ticket.address);
      ticket.tickets.map((ticket) => {
        const txHashArray = ticketAndTxMap.get(ticket) ?? [];
        ticketAndTxMap.set(ticket, [txHash, ...txHashArray]);
      });
    }
    const poolOjb = JSON.parse(pool) as PoolType;
    const hitTicket: string =
      poolOjb.difficulty == Difficulty.MATCH
        ? lotteryResult
        : this.__findClosestHexNumber([...ticketAndTxMap.keys()], lotteryResult);
    const hitTx = ticketAndTxMap.get(hitTicket);
    const hitAddr = hitTx?.map((tx) => txAndAddressMap.get(tx));
    //开奖号码
    await this.kv.hsetnx(
      currentPhase as string,
      ConstantField.PHASE_RESULT_FIELD,
      JSON.stringify({
        poolCode,
        currentPhase,
        ticketCount: ticketAndTxMap.size,
        lotteryResult,
        hitTx,
        hitAddr,
        hitTicket,
      } as PhaseResult),
    );
    return currentPhase;
  }

  async createTicket(props: TicketType, refCode?: string) {
    let currentPhase = await this.kv.hget(ConstantKey.LOTTERY_CURRENT_PHASE, props.poolCode);
    if (!currentPhase) {
      currentPhase = await this.__startNewPhase(props.poolCode);
    }
    const ticketCount = props.tickets.length;
    //归入某期计数
    const nx = await this.kv.hsetnx(
      currentPhase as string,
      props.txHash,
      JSON.stringify({ ...props }),
    );
    //repeat submitted
    if (nx != 1) {
      return false;
    }
    await this.kv.hincrby(
      currentPhase as string,
      ConstantField.PHASE_TICKET_COUNT_FIELD,
      ticketCount,
    );
    //归入用户积分
    const userKey = this.getUserNamespace(props.address);
    const result = await this.kv.hsetnx(
      userKey,
      props.txHash,
      JSON.stringify({ ...props, currentPhase }),
    );
    await this.kv.hincrby(userKey, ConstantField.USER_POINT_SUM_FIELD, ticketCount * 100);
    if (refCode) {
      //保存我的推荐人
      await this.kv.hsetnx(userKey, ConstantField.USER_REF_CODE, refCode);
      //推荐人积分
      const refAddr = await this.kv.hget(ConstantKey.LOTTERY_REFERRAL_TO_USER, refCode);
      const refKey = this.getUserNamespace(refAddr as string);
      await this.kv.hincrby(refKey, ConstantField.USER_REF_POINT_SUM_FIELD, ticketCount * 50);
      //统计推荐人头数
      await this.kv.hincrby(refKey, ConstantField.USER_REF_TO_COUNT_FIELD, 1);
      //找到推荐人的推荐人
      const refRefCode = (await this.kv.hget(refKey, ConstantField.USER_REF_CODE)) as string;
      if (refRefCode) {
        const refRefAddr = await this.kv.hget(ConstantKey.LOTTERY_REFERRAL_TO_USER, refRefCode);
        await this.kv.hincrby(
          this.getUserNamespace(refRefAddr as string),
          ConstantField.USER_REF_POINT_SUM_FIELD,
          ticketCount * 25,
        );
      }
    }
    return result == 1;
  }

  private async __startNewPhase(poolCode: string) {
    const newPhash = `LOTTERY_PHASE_${moment().format("YYYYMMDDHHmmss")}`;
    //当前池新的周期
    const lastPhase = await this.kv.hget(ConstantKey.LOTTERY_CURRENT_PHASE, poolCode);
    await this.kv.hset(ConstantKey.LOTTERY_CURRENT_PHASE, { [poolCode]: newPhash });
    if (lastPhase) {
      await this.kv.hset(ConstantKey.LOTTERY_LAST_PHASE, { [poolCode]: lastPhase });
    }
    return newPhash;
  }

  private __findClosestHexNumber(hexNumbers: string[], targetHex: string): string {
    const targetDec: number = parseInt(targetHex, 16);
    let closestHex: string = hexNumbers[0];
    let minDifference: number = Math.abs(parseInt(closestHex, 16) - targetDec);

    for (let i = 1; i < hexNumbers.length; i++) {
      const currentHex: string = hexNumbers[i];
      const currentDec: number = parseInt(currentHex, 16);
      const difference: number = Math.abs(currentDec - targetDec);

      if (difference < minDifference) {
        minDifference = difference;
        closestHex = currentHex;
      }
    }
    return closestHex;
  }

  randomHex() {
    return Number(Math.floor(Math.random() * 10000000) + 1).toString(16);
  }

  getUserNamespace(address: string) {
    return `LOTTERY_ADDR_${address}`;
  }
}

const lottery = new LotteryService();

export { lottery, Difficulty, ConstantKey, ConstantField };
export type {
  ResponseTPRC,
  PoolType,
  TicketType,
  PhaseResult,
  PoolStateType,
  LotteryPointType,
  MyTicketType,
};
