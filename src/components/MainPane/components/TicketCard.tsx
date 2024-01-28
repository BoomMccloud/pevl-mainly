import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Button, Flex, HStack, Icon, Link, Tag, Text } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { FaSadCry } from "react-icons/fa";
import { GiLaurelsTrophy } from "react-icons/gi";
import { useAccount, useNetwork } from "wagmi";

import Countdown from "@/app/_components/Countdown";
import { nextTime } from "@/app/_util/util";
import { Container } from "@/components/Container";
import { CHAIN_CONFIG } from "@/const";
import { useNotify } from "@/hooks/useNotify";
import type { MyTicketType } from "@/server/lib/LotteryTypes";
import { api } from "@/trpc/react";
import { getEllipsisTxt } from "@/utils/formatters";

const ContainerText = styled(HStack)`
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
`;
export const TicketCard = (props: MyTicketType) => {
  const { currentPhase, ticketCount, pool, phaseTicketCount, isWon, result } = props;
  const { address } = useAccount();
  const { notifyError, notifySuccess } = useNotify();
  const { chain } = useNetwork();

  const dateTime = currentPhase.slice(-14);
  const year = dateTime.substring(0, 4);
  const month = dateTime.substring(4, 6);
  const day = dateTime.substring(6, 8);

  const handleTransfer = api.user.claimPrize.useMutation({
    onSuccess: (data) => {
      notifySuccess(
        data.result
          ? {
              title: "Submitted Claim!",
              message: (
                <>
                  <Link
                    href={`${CHAIN_CONFIG[chain!.id].blockExplorer}/tx/${data.result}`}
                    isExternal
                  >
                    {" "}
                    {getEllipsisTxt(data.result as `0x${string}`)}
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </>
              ),
            }
          : {
              title: "Claimed Already!",
              message: <>Please waiting for a few moment refresh page</>,
            },
      );
    },
    onError: (error) => {
      notifyError({
        title: "Purchase Failed:",
        message: error.message,
      });
    },
  });
  return (
    <Container w="100%" maxW="400px">
      <ContainerText>
        <Text>Pool</Text>
        <Text>{pool.name}</Text>
      </ContainerText>
      <ContainerText>
        <Text>Date</Text>
        <Text>
          {day} {month} {year}
        </Text>
      </ContainerText>
      <ContainerText>
        <Text>Bet</Text>
        <Text>{(ticketCount * pool.price).toFixed(3)} ETH</Text>
      </ContainerText>
      <ContainerText>
        <Text>Prize Pool</Text>
        <Text>{(phaseTicketCount * pool.price).toFixed(3)} ETH</Text>
      </ContainerText>
      <ContainerText>
        <Text>Result</Text>
        <Text>
          {isWon == undefined ? (
            <Countdown targetDate={nextTime(pool.period)} />
          ) : isWon ? (
            <Flex>
              <Icon as={GiLaurelsTrophy} w={8} h={8} color="#F8EF00" />
              &nbsp;{" "}
              {address && result?.claimed && result?.claimed[address] ? (
                <Link
                  href={`${CHAIN_CONFIG[chain!.id].blockExplorer}/tx/${result?.claimed[address]}`}
                  isExternal
                >
                  <Tag>Claimed</Tag>
                </Link>
              ) : (
                <Button
                  className="custom-button"
                  onClick={() =>
                    handleTransfer.mutate({
                      address: address as string,
                      phase: currentPhase,
                    })
                  }
                  isLoading={handleTransfer.isLoading}
                >
                  Claim You Prize
                </Button>
              )}
            </Flex>
          ) : (
            <Icon as={FaSadCry} w={8} h={8} color="red" />
          )}
        </Text>
      </ContainerText>
    </Container>
  );
};
