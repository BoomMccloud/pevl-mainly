import type { Chain } from "wagmi";

import { type PoolType } from "@/server/lib/LotteryTypes";

const InitPoolConfig: Record<string, { prop: PoolType; wallet: string }> = {
  // "System-PowerBlast-0001": {
  //   prop: {
  //     name: "PowerBlast",
  //     poolCode: "System-PowerBlast-0001",
  //     difficulty: Difficulty.MATCH,
  //     period: "*/30 * * * *",
  //     price: 0.1,
  //     prize: 50,
  //   },
  //   wallet: ["", ""],
  // },
  "System-DailyLotto-0002": {
    prop: {
      name: "Daily Jolt",
      poolCode: "System-DailyLotto-0002",
      difficulty: "CLOSEST",
      period: "15 19 * * *",
      price: 0.1,
      prize: 10,
    },
    wallet: "0xee04eb372ed1010232691eab44a16e3c7f4c5943322488e4933a274309813e31",
  },
};

const sepoliaBlast = {
  id: 168587773,
  network: "blast-sepolia",
  name: "Blast Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    // alchemy: {
    //   http: ["https://base-mainnet.g.alchemy.com/v2"],
    //   webSocket: ["wss://base-mainnet.g.alchemy.com/v2"],
    // },
    // infura: {
    //   http: ["https://base-mainnet.infura.io/v3"],
    //   webSocket: ["wss://base-mainnet.infura.io/ws/v3"],
    // },
    default: {
      http: ["https://sepolia.blast.io"],
    },
    public: {
      http: ["https://sepolia.blast.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blast Sepolia Explorer",
      url: "https://testnet.blastscan.io",
    },
    etherscan: {
      name: "Blast Sepolia Explorer",
      url: "https://testnet.blastscan.io",
    },
  },
} as const satisfies Chain;

export { InitPoolConfig, sepoliaBlast };
