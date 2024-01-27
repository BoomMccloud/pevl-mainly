"use client";

import { useEffect } from "react";

import {
  Alert,
  Button,
  Center,
  Heading,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  useClipboard,
  VStack,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";

import type { LotteryPointType } from "@/server/lib/LotteryTypes";
import { api } from "@/trpc/react";

function Airdrop() {
  const { address } = useAccount();
  const { data } = api.user.getReferral.useQuery({ address: address ?? "" });
  const pointObj = data?.result as LotteryPointType;
  const { onCopy, setValue, hasCopied } = useClipboard("");

  useEffect(() => {
    setValue(`${window?.location?.origin}?referral=${pointObj?.code}` ?? "");
  }, [pointObj?.code, setValue]);

  return (
    <>
      <VStack alignItems={"stretch"} maxW="md">
        <Heading as="h2" fontSize={"2rem"} mb={10} className="text-shadow">
          Referrals
        </Heading>
        <StatGroup mb={6}>
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
        <text>
          Receive 50% of your referral&apos;s points and 25% of their referral&apos;s points with
          the link below:
        </text>
        <Center mb={6}>
          <Button onClick={onCopy}>{hasCopied ? "Copied!" : "Copy Referral Link"}</Button>
        </Center>
        <Alert fontSize={"sm"}>
          Testnet points can win real prizes! If PEVL wins Blast&apos;s BigBang competition, 1/3 of
          the Blast points Will be airdropped to testnet users.
        </Alert>
      </VStack>
      {/* <Card maxW="md">
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
            hackathon. Also, we want to launch quickly, iron out bugs, and get initial user
            feedback. To incentivize users, we will provide points when using Testnet.
          </Alert>
        </CardFooter>
      </Card> */}
    </>
  );
}

export default Airdrop;
