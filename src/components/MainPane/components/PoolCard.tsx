import { useEffect } from "react";

import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Text,
  useNumberInput,
  VStack,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import Countdown, { zeroPad } from "react-countdown";
import { parseEther } from "viem";
import { useAccount, useNetwork, useSendTransaction, useWaitForTransaction } from "wagmi";

import { nextTime } from "@/app/_util/util";
import { ticketPath } from "@/components/Header/Header";
import { CHAIN_CONFIG, FUND_WALLET_ADDRESS } from "@/const";
import { useNotify } from "@/hooks";
import type { PoolStateType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";
import { getEllipsisTxt } from "@/utils/formatters";

export const PoolCard = ({ pool, currentPhase }: PoolStateType) => {
  const { name, price, poolCode, period } = pool;
  const { isConnected } = useAccount();

  const { data, error, isLoading, isError, sendTransaction } = useSendTransaction();
  const { data: receipt, isLoading: isPending } = useWaitForTransaction({ hash: data?.hash });
  const { notifyError, notifySuccess } = useNotify();
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const { chain } = useNetwork();

  const saveOrUpdate = api.user.saveTickets.useMutation({
    onSuccess: () => {
      notifySuccess({
        title: "Successfully bought tickets!",
        message: (
          <>
            {receipt?.transactionHash && (
              <>
                Hash:
                <Link
                  href={`${CHAIN_CONFIG[chain!.id].blockExplorer}/tx/${receipt?.transactionHash}`}
                  isExternal
                >
                  {" "}
                  {getEllipsisTxt(receipt?.transactionHash)}
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </>
            )}
            <Box>
              <Link as={NextLink} href={ticketPath}>
                Check your tickets
              </Link>
            </Box>
          </>
        ),
      });
    },
    onError: (error) => {
      notifyError({
        title: "Purchase Failed:",
        message: error.message,
      });
    },
  });

  const {
    getInputProps,
    getIncrementButtonProps,
    getDecrementButtonProps,
    valueAsNumber: ticketAmount,
  } = useNumberInput({
    step: 1,
    defaultValue: 1,
    min: 1,

    precision: 0,
    clampValueOnBlur: true,
  });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  const handleTransfer = () => {
    sendTransaction({
      to: FUND_WALLET_ADDRESS,
      value: parseEther((ticketAmount * price).toString()),
    });
  };

  useEffect(() => {
    if (receipt) {
      saveOrUpdate.mutate({
        poolCode,
        ticketNum: ticketAmount,
        address: address as string,
        txHash: receipt.transactionHash,
        txTime: new Date().getTime(),
        referral: searchParams.get("referral") ?? undefined,
      });
    }

    if (isError && error) {
      notifyError({
        title: "An error occured:",
        message: error.message,
      });
    }
  }, [receipt, isError, error]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Card>
      <CardBody>
        <Stack mt="6" spacing="3" alignItems="stretch">
          <HStack justifyContent="center">
            <Heading size="md">{name}</Heading>
          </HStack>

          <Heading as="h2" fontSize={"2rem"} mb={3}>
            Prize: {((currentPhase?.ticketCount ?? 0) * price).toFixed(3)} ETH
          </Heading>
          <Countdown
            date={nextTime(period)}
            zeroPadTime={2}
            renderer={({ hours, minutes, completed }) => {
              if (completed) {
                // Render a completed state
                return <span>Round Ended, go to ... to check if you win this round</span>;
              } else {
                // Render a countdown
                return (
                  <HStack justifyContent="center">
                    <VStack gap={0}>
                      <Heading as="h1" style={{ fontSize: 24 }}>
                        {zeroPad(hours)}
                      </Heading>
                      <Text color="grey" as="h6" style={{ fontSize: 16, fontWeight: 500 }}>
                        HRS
                      </Text>
                    </VStack>
                    <VStack gap={0}>
                      <Heading as="h1" style={{ fontSize: 24 }}>
                        {zeroPad(minutes)}
                      </Heading>
                      <Text color="grey" as="h6" style={{ fontSize: 16, fontWeight: 500 }}>
                        MINS
                      </Text>
                    </VStack>
                    {/* <VStack gap={0}>
                      <Heading as="h1" style={{ fontSize: 24 }}>
                        {zeroPad(seconds)}
                      </Heading>
                      <Text color="grey" as="h6" style={{ fontSize: 16, fontWeight: 500 }}>
                        SECS
                      </Text>
                    </VStack> */}
                  </HStack>
                );
              }
            }}
          ></Countdown>

          <Text>Number of Tickets</Text>

          <HStack mb={2}>
            <Button {...dec}>-</Button>
            <Input {...input} style={{ textAlign: "center" }} />
            <Button className="custom-button" {...inc}>
              +
            </Button>
          </HStack>
          <Text>Price {(price * Number(ticketAmount)).toFixed(4)} ETH</Text>
          {isConnected ? (
            <Button
              className="custom-button"
              onClick={handleTransfer}
              isLoading={isLoading || isPending}
            >
              Enter The Drawing!
            </Button>
          ) : (
            <Box display="flex" justifyContent="center">
              <ConnectButton />
            </Box>
          )}
        </Stack>
        <Text>Testnet PEVL points can win real Blast points. The raffle is verifiably random.</Text>
      </CardBody>
    </Card>
  );
};
