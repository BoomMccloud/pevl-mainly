import { Difficulty, type PoolType } from "@/server/lib/LotteryService";

const InitPoolConfig: Record<string, { prop: PoolType; wallet: [string, string] }> = {
  "System-PowerBlast-0001": {
    prop: {
      name: "PowerBlast",
      poolCode: "System-PowerBlast-0001",
      difficulty: Difficulty.MATCH,
      period: "*/30 * * * *",
      price: 0.1,
      prize: 5,
    },
    wallet: ["", ""],
  },
  "System-DailyLotto-0002": {
    prop: {
      name: "DailyLotto",
      poolCode: "System-DailyLotto-0002",
      difficulty: Difficulty.CLOSEST,
      period: "15 19 * * *",
      price: 0.2,
      prize: 10,
    },
    wallet: ["", ""],
  },
};
export default InitPoolConfig;
