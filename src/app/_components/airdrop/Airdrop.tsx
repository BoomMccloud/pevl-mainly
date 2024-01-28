"use client";

import { useEffect } from "react";

import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
  Link as ChakraLink,
  HStack,
  Heading,
  IconButton,
  Text,
  VStack,
  useClipboard,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { useAccount } from "wagmi";

import { Container } from "@/components/Container";
import type { LotteryPointType } from "@/server/lib/LotteryTypes";
import { api } from "@/trpc/react";

const ContainerText = styled(HStack)`
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
`;
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
        <Container mb={4}>
          <ContainerText>
            <Text>Total Points</Text>
            <Text>{pointObj?.points ?? 0}</Text>
          </ContainerText>
          <ContainerText>
            <Text>Your Referrals</Text>
            <Text>{pointObj?.refNum ?? 0}</Text>
          </ContainerText>
          <ContainerText>
            <Text>Referrals Points</Text>
            <Text>{pointObj?.refPoints ?? 0}</Text>
          </ContainerText>
        </Container>
        <Text mb={4}>
          Receive 50% of your referral&apos;s points and 25% of their referral&apos;s points with
          the link below:
        </Text>
        <Container mb={4}>
          <ContainerText>
            <Text>{`${window?.location?.origin}?referral=${pointObj?.code}`}</Text>
            <IconButton
              colorScheme="brand"
              aria-label="Copy"
              icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
              onClick={onCopy}
              size="sm"
            />
            {/* <Text>{pointObj?.points ?? 0}</Text> */}
          </ContainerText>
        </Container>
        {/* <Center mb={6}>
          <Button onClick={onCopy}>{hasCopied ? "Copied!" : "Copy Referral Link"}</Button>
        </Center> */}
        <Text>
          Testnet PEVL points can win real Blast points. The raffle is verifiably random{" "}
          <ChakraLink
            color="yellow"
            as={"a"}
            href="https://pevl.gitbook.io/pevl/our-games/daily-raffle"
          >
            {" "}
            (Learn more).
          </ChakraLink>
        </Text>
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
