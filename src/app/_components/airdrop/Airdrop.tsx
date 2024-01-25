"use client";

import React from "react";

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Heading,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tag,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";

import Qr from "@/app/_components/Qr";
import type { LotteryPointType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

function Airdrop() {
  const { address } = useAccount();
  const { data } = api.user.getReferral.useQuery({ address: address ?? "" });
  const pointObj = data?.result as LotteryPointType;
  return (
    <Card maxW="md">
      <CardHeader>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
            <Box>
              <Heading size="sm">{pointObj?.code ?? "-"}</Heading>
              <Tag>Referral Code</Tag>
            </Box>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        <StatGroup>
          <Stat>
            <StatLabel>Your Points</StatLabel>
            <StatNumber>{pointObj?.points ?? 0}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Referrals Points</StatLabel>
            <StatNumber>{pointObj?.refPoints ?? 0}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Your Referrals</StatLabel>
            <StatNumber>{pointObj?.refNum ?? 0}</StatNumber>
          </Stat>
        </StatGroup>
      </CardBody>
      <Center>
        <Qr text={pointObj?.code} />
      </Center>

      <CardFooter
        justify="space-between"
        flexWrap="wrap"
        sx={{
          "& > button": {
            minW: "136px",
          },
        }}
      >
        <Alert fontSize={"sm"}>
          We believe that Blast will be looking for traction from projects when evaluating for the
          hackathon. Also, we want to launch quickly, iron out bugs, and get initial user feedback.
          To incentivize users, we will provide points when using Testnet.
        </Alert>
      </CardFooter>
    </Card>
  );
}

export default Airdrop;
