type ResponseTPRC = {
  code: number;
  message: string;
  result?: object | string | number | boolean | undefined;
};

type PoolStateType = {
  pool: PoolType;
  currentPhase: PhaseResult | undefined;
  lastPhase: PhaseResult | undefined;
};
type ReferralInfo = { code: string; points: number; refPoints: number; refNum: number };
/**
 * 抽奖的参数
 * 名称，难度系数，周期（多少个区块）
 */
type PoolType = {
  poolCode: string;
  name: string;
  difficulty: "MATCH" | "CLOSEST";
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
  lotteryResult?: string;
  hitTx?: string;
  hitAddr?: string[];
  hitTicket?: string;
  claimed?: Record<string, string>;
};

type LotteryPointType = {
  code: string;
  points: number;
  refPoints: number;
  refNum: number;
};

export type {
  ResponseTPRC,
  PoolType,
  TicketType,
  PhaseResult,
  PoolStateType,
  LotteryPointType,
  MyTicketType,
  ReferralInfo,
};
