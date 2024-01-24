"use client";

import React from "react";

import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Heading,
  Icon,
  List,
  ListItem,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
} from "@chakra-ui/react";
import { GiLaurelsTrophy } from "react-icons/gi";
import { useAccount } from "wagmi";

import Countdown from "@/app/_components/Countdown";
import { nextTime } from "@/app/_util/util";
import type { PhaseResult, PoolType } from "@/server/lib/LotteryService";

function PoolState(props: { title: string; pool: PoolType; phaseResult: PhaseResult | undefined }) {
  const { address } = useAccount();
  const { title, pool, phaseResult } = props;

  return (
    <>
      <StatGroup>
        <Stat>
          <StatLabel>Collected Fees</StatLabel>
          <StatNumber>{(phaseResult?.ticketCount ?? 0) * pool.price} ETH</StatNumber>
          <StatHelpText>
            <StatArrow type={"increase"} />
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Tickets Count</StatLabel>
          <StatNumber>{phaseResult?.ticketCount ?? 0} </StatNumber>
          <StatHelpText>
            <StatArrow type={"increase"} />
          </StatHelpText>
        </Stat>
      </StatGroup>
      <Box>
        <List spacing={2} pt="2">
          <ListItem>
            {phaseResult && (
              <Tag>
                ({phaseResult.currentPhase?.slice(-14) ?? "###"}) ({phaseResult?.lotteryResult})
              </Tag>
            )}
          </ListItem>
          {phaseResult?.lotteryResult ? (
            <>
              <ListItem>
                {phaseResult?.hitAddr && (
                  <Tag color="green.700">
                    {phaseResult?.hitAddr ?? "#############"}#{phaseResult?.hitTicket ?? "###"}
                  </Tag>
                )}
              </ListItem>
              <ListItem>
                {phaseResult?.hitAddr == address ? (
                  <Icon as={GiLaurelsTrophy} w={8} h={8} color="yellow.300" />
                ) : (
                  <Icon as={CloseIcon} w={8} h={8} color="red.500" />
                )}
              </ListItem>
            </>
          ) : (
            <Countdown targetDate={nextTime(pool.period)} />
          )}
        </List>
        <Heading size="xs" textTransform="uppercase">
          Lottery {title} Results
        </Heading>
      </Box>
    </>
  );
}

export default PoolState;
