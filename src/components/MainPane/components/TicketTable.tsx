import React from "react";

import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Stat,
  StatHelpText,
  StatNumber,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import moment from "moment";
import { FaSadCry } from "react-icons/fa";
import { GiLaurelsTrophy } from "react-icons/gi";
import { useAccount, useNetwork } from "wagmi";

import Countdown from "@/app/_components/Countdown";
import { nextTime } from "@/app/_util/util";
import { CHAIN_CONFIG } from "@/const";
import { useNotify } from "@/hooks";
import type { MyTicketType } from "@/server/lib/LotteryTypes";
import { api } from "@/trpc/react";
import { getEllipsisTxt } from "@/utils/formatters";

export const TicketTable: React.FC = () => {
  const { address } = useAccount();
  const { notifyError, notifySuccess } = useNotify();
  const { chain } = useNetwork();
  const { data, isLoading } = api.user.ticketsList.useQuery(
    { address: address as string },
    { enabled: !!address },
  );
  // const { data: poolData } = api.pool.poolList.useQuery();
  // const pools = poolData?.result as Array<PoolType>;

  const records = data?.result as Record<string, MyTicketType>;
  const tickets = Object.values(records ?? {});
  tickets?.sort((a, b) => b.currentPhase.localeCompare(a.currentPhase));

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
                    {getEllipsisTxt(data.result)}
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
    <>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Spinner color="yellow" />
        </Box>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Draw Number</Th>
                <Th>Bet</Th>
                <Th>Prize</Th>
                <Th>Result</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tickets.map((record) => {
                return (
                  <Tr key={`ticket-${record.currentPhase}`}>
                    <Td>{record.currentPhase?.slice(-14)}</Td>
                    <Td>
                      <Popover>
                        <PopoverTrigger>
                          <Tag fontSize={"xl"} bg="blue.300">
                            {(record.ticketCount * record.pool.price).toFixed(3)}ETH
                          </Tag>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>Ticket Count:{record.ticketCount}!</PopoverHeader>
                          <PopoverBody>
                            {record.txList.map((tx) => {
                              return (
                                <Box key={tx.txHash}>
                                  {moment(tx.txTime).format("YYYY-MM-DD HH:mm:ss")} - {tx.tickets}
                                </Box>
                              );
                            })}
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Td>
                    <Td>
                      <Stat>
                        <StatNumber>
                          {(record.phaseTicketCount * record.pool.price).toFixed(3)} ETH
                        </StatNumber>
                        <StatHelpText>{record.pool.name}</StatHelpText>
                      </Stat>
                    </Td>
                    <Td>
                      <Box>
                        {record.isWon == undefined ? (
                          <Countdown targetDate={nextTime(record.pool.period)} />
                        ) : record.isWon ? (
                          <Flex>
                            <Icon as={GiLaurelsTrophy} w={8} h={8} color="yellow.300" />
                            &nbsp;{" "}
                            {address &&
                            record.result?.claimed &&
                            record.result?.claimed[address] ? (
                              <Link
                                href={`${CHAIN_CONFIG[chain!.id].blockExplorer}/tx/${record.result
                                  ?.claimed[address]}`}
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
                                    phase: record.currentPhase,
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
                      </Box>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};
