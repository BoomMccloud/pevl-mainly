import "server-only";
import type Redis from "ioredis";
import moment from "moment";
import { nanoid } from "nanoid";
import { createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { kvStore } from "@/server/lib/kv/Persistence";
import type {
  PhaseResult,
  PoolStateType,
  ReferralInfo,
  TicketType,
} from "@/server/lib/LotteryTypes";
import { InitPoolConfig, sepoliaBlast } from "@/server/lib/PoolConfig";

class LotteryService {
  kv: Redis;

  constructor() {
    this.kv = kvStore.getClient() as Redis;
  }

  async init() {
    for (const poolKey in InitPoolConfig) {
      await this.__startNewPhase(poolKey);
    }
  }

  async poolState() {
    const pipeline = this.kv.pipeline();
    const poolRecord = InitPoolConfig;
    pipeline.hgetall(ConstantKey.LOTTERY_CURRENT_PHASE);
    pipeline.hgetall(ConstantKey.LOTTERY_LAST_PHASE);
    const results = await pipeline.exec();
    let currentPhaseKeyRecord;
    let lastPhaseKeyRecord;
    if (results?.length == 2) {
      currentPhaseKeyRecord = results[0][1] as Record<string, string>;
      lastPhaseKeyRecord = results[1][1] as Record<string, string>;
    }
    const poolList = new Array<PoolStateType>();
    //for
    for (const poolCode in poolRecord) {
      const pool = { ...poolRecord[poolCode].prop };
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
    // 摇奖对比,获取池信息
    const pool = InitPoolConfig[poolCode].prop;
    if (!pool) {
      return false;
    }
    const currentPhase = await this.kv.hget(ConstantKey.LOTTERY_LAST_PHASE, poolCode);
    //获取当前所有用户信息<txHash:
    const phaseTickets = await this.kv.hgetall(currentPhase as string);
    if (!phaseTickets) {
      return false;
    }
    //准备数据
    const ticketAndTxMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    const txAndAddressMap: Map<string, string> = new Map<string, string>();

    for (const txHash in phaseTickets) {
      if (txHash.startsWith("_FIELD_")) {
        continue;
      }
      const ticket = JSON.parse(phaseTickets[txHash]) as TicketType;
      txAndAddressMap.set(txHash, ticket.address);
      ticket.tickets.map((ticket) => {
        const txHashArray = ticketAndTxMap.get(ticket) ?? [];
        ticketAndTxMap.set(ticket, [txHash, ...txHashArray]);
      });
    }
    const hitTicket: string =
      pool.difficulty == "MATCH"
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

  async claimPrize(address: string, phase: string) {
    const result = await this.kv.hget(phase, ConstantField.PHASE_RESULT_FIELD);
    if (!result) {
      console.error("Not Date", address, phase);
      return undefined;
    }
    const phaseResult = JSON.parse(result) as PhaseResult;
    const { hitAddr, poolCode, ticketCount, claimed } = phaseResult;
    const { prop, wallet } = InitPoolConfig[poolCode];
    const account = privateKeyToAccount(wallet as `0x${string}`);
    if (hitAddr?.includes(address) && !(claimed && claimed[address])) {
      const prize = (ticketCount * prop.price) / hitAddr?.length;
      const walletClient = createWalletClient({
        account,
        chain: sepoliaBlast,
        transport: http(),
      });
      const txHash = (await walletClient.sendTransaction({
        to: address as `0x${string}`,
        value: parseUnits(prize.toString(), sepoliaBlast.nativeCurrency.decimals),
      })) as string;
      await this.kv.hset(
        phase,
        ConstantField.PHASE_RESULT_FIELD,
        JSON.stringify({
          ...phaseResult,
          claimed: { claimed, [address]: txHash },
        }),
      );
      return txHash;
    }
    console.error("Not Hit", address, phase);
    return undefined;
  }

  async createTicket(props: TicketType) {
    const userNamespace = this.getUserNamespace(props.address);
    const commander = this.kv.pipeline();
    const ticketCount = props.tickets.length;

    //归档
    commander.hget(ConstantKey.LOTTERY_CURRENT_PHASE, props.poolCode, async (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      if (result) {
        //归入用户空间
        commander.hsetnx(
          userNamespace,
          props.txHash,
          JSON.stringify({ ...props, currentPhase: result }),
        );
        //用户自积分
        commander.hincrby(userNamespace, ConstantField.USER_POINT_SUM_FIELD, ticketCount * 100);
        //归入期空间
        commander.hsetnx(result, props.txHash, JSON.stringify({ ...props }));
        //计票
        commander.hincrby(result, ConstantField.PHASE_TICKET_COUNT_FIELD, ticketCount);
        await commander.exec();
      }
    });

    // 推荐人
    commander.hget(userNamespace, ConstantField.USER_FROM_REF_CODE, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      if (result) {
        //推荐人转地址
        commander.hget(ConstantKey.LOTTERY_REFERRAL_TO_USER, result, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }
          if (result) {
            const myRefNamespace = this.getUserNamespace(result as string);
            //推荐人积分
            commander.hincrby(
              myRefNamespace,
              ConstantField.USER_REF_POINT_SUM_FIELD,
              ticketCount * 50,
            );
            // 推荐人人的推荐人
            commander.hget(
              myRefNamespace,
              ConstantField.USER_FROM_REF_CODE,
              async (err, result) => {
                if (err) {
                  console.error(err);
                  return;
                }
                if (result) {
                  //推荐人转地址
                  commander.hget(
                    ConstantKey.LOTTERY_REFERRAL_TO_USER,
                    result,
                    async (err, result) => {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      if (result) {
                        const myRef2RefNamespace = this.getUserNamespace(result);
                        //推荐人积分
                        commander.hincrby(
                          myRef2RefNamespace,
                          ConstantField.USER_REF_POINT_SUM_FIELD,
                          ticketCount * 25,
                        );
                        await commander.exec();
                      }
                    },
                  );
                  await commander.exec();
                }
              },
            );
          }
        });
      }
    });
    const multiResult = await commander.exec();
    console.log(multiResult);
    return true;
  }

  async referralInfo(address: string) {
    const userNamespace = this.getUserNamespace(address);
    const pipeline = this.kv.pipeline();
    pipeline.hget(userNamespace, ConstantField.USER_REF_CODE);
    pipeline.hget(userNamespace, ConstantField.USER_POINT_SUM_FIELD);
    pipeline.hget(userNamespace, ConstantField.USER_REF_POINT_SUM_FIELD);
    pipeline.hget(userNamespace, ConstantField.USER_REF_TO_COUNT_FIELD);
    const result = await pipeline.exec();
    const code = result && result[0] ? result[0][1] : ``;
    const points = result && result[1] ? result[1][1] : 0;
    const refPoints = result && result[2] ? result[2][1] : 0;
    const refNum = result && result[3] ? result[3][1] : 0;
    return { code, points, refPoints, refNum } as ReferralInfo;
  }

  async signIn(address: string | null, refCode: string | undefined) {
    if (!address) {
      return;
    }
    const userNamespace = this.getUserNamespace(address);
    const commander = this.kv.pipeline();

    commander.hget(userNamespace, ConstantField.USER_REF_CODE, async (err, result) => {
      if (err) {
        console.error(err);
      }
      let code = result;
      while (!code) {
        code = nanoid(8);
        if ((await this.kv.hsetnx(ConstantKey.LOTTERY_REFERRAL_TO_USER, code, address)) == 1) {
          this.kv.hset(userNamespace, ConstantField.USER_REF_CODE, code);
          break;
        }
        code = null;
      }
    });

    if (refCode) {
      commander.hsetnx(userNamespace, ConstantField.USER_FROM_REF_CODE, refCode, (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result == 1) {
          //推荐人转地址
          commander.hget(ConstantKey.LOTTERY_REFERRAL_TO_USER, refCode, (err, result) => {
            if (err) {
              console.error(err);
              return;
            }
            if (result) {
              const myRefNamespace = this.getUserNamespace(result);
              //推荐人
              commander.hincrby(myRefNamespace, ConstantField.USER_REF_TO_COUNT_FIELD, 1);
              commander.exec();
            }
          });
          commander.exec();
        }
      });
    }
    const result = await commander.exec();
    console.log(result);
    return result && result[0] == null;
  }

  private async __startNewPhase(poolCode: string) {
    const newPhash = `LOTTERY_PHASE_${moment().format("YYYYMMDDHHmmss")}`;
    //当前池新的周期
    const pipeline = this.kv.pipeline();
    const lastPhase = await this.kv.hget(ConstantKey.LOTTERY_CURRENT_PHASE, poolCode);
    pipeline.hset(ConstantKey.LOTTERY_CURRENT_PHASE, { [poolCode]: newPhash });
    if (lastPhase) {
      pipeline.hset(ConstantKey.LOTTERY_LAST_PHASE, { [poolCode]: lastPhase });
    }
    await pipeline.exec();
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

  getUserNamespace(address: string | undefined) {
    if (!address) {
      return "";
    }
    return `LOTTERY_ADDR_${address}`;
  }
}

enum ConstantKey {
  //当前期code
  LOTTERY_CURRENT_PHASE = "LOTTERY_CURRENT_PHASE",
  //最近期code
  LOTTERY_LAST_PHASE = "LOTTERY_LAST_PHASE",
  //code对应的用户
  LOTTERY_REFERRAL_TO_USER = "LOTTERY_REFERRAL_TO_USER",
}

enum ConstantField {
  //每期开奖结果
  PHASE_RESULT_FIELD = "_FIELD_PHASE_RESULT",
  //票证总数
  PHASE_TICKET_COUNT_FIELD = "_FIELD_PHASE_TICKET_COUNT",
  //自己积分总数
  USER_POINT_SUM_FIELD = "_FIELD_USER_POINT_SUM",
  //别人帮我积分
  USER_REF_POINT_SUM_FIELD = "_FIELD_USER_REF_POINT_SUM",
  //推荐了多少人
  USER_REF_TO_COUNT_FIELD = "_FIELD_USER_REF_TO_COUNT",
  //我的推荐code
  USER_REF_CODE = "_FIELD_USER_REF_CODE",
  //我的推荐人code
  USER_FROM_REF_CODE = "_FIELD_USER_FROM_REF_CODE",
}

const lottery = new LotteryService();

export { lottery, ConstantKey, ConstantField };
