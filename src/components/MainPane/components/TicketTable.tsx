import React from "react";

import {
  Box,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
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
  Spinner,
} from "@chakra-ui/react";
import moment from "moment";
import { FaSadCry } from "react-icons/fa";
import { GiLaurelsTrophy } from "react-icons/gi";
import { useAccount } from "wagmi";

import Countdown from "@/app/_components/Countdown";
import { nextTime } from "@/app/_util/util";
import type { MyTicketType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

export const TicketTable: React.FC = () => {
  const { address } = useAccount();

  const { data, isLoading } = api.user.ticketsList.useQuery(
    { address: address as string },
    { enabled: !!address },
  );
  // const { data: poolData } = api.pool.poolList.useQuery();
  // const pools = poolData?.result as Array<PoolType>;

  const records = data?.result as Record<string, MyTicketType>;
  const tickets = Object.values(records ?? {});
  tickets?.sort((a, b) => b.currentPhase.localeCompare(a.currentPhase));
  //
  // const records = data?.result as Record<string, TicketType>;
  // const tickets = Object.values(records ?? {});
  //
  // const poolDetails = pools?.reduce(
  //   (acc, pool) => {
  //     acc[pool.poolCode] = pool;
  //     return acc;
  //   },
  //   {} as Record<string, PoolType>,
  // );
  // console.log(tickets);
  // const mergeTickets = tickets.reduce(
  //   (acc, ticket) => {
  //     console.log("acc", acc);
  //     const key = ticket.currentPhase + ticket.poolCode;
  //     if (acc[key]) {
  //       console.log("concat", ticket.tickets);
  //       acc[key].tickets = acc[key].tickets.concat(ticket.tickets);
  //     } else {
  //       acc[key] = ticket;
  //     }
  //     return acc;
  //   },
  //   {} as Record<string, TicketType>,
  // );
  //
  // console.log(mergeTickets);
  //
  // const sortedTickets = Object.values(mergeTickets).sort((a, b) =>
  //   a.currentPhase.slice(-14) > b.currentPhase.slice(-14) ? 1 : -1,
  // );
  // console.log(sortedTickets);
  return (
    <>
      {/*<TableContainer>*/}
      {/*  <Table variant="simple">*/}
      {/*    <Thead>*/}
      {/*      <Tr>*/}
      {/*        <Th>Phase</Th>*/}
      {/*        <Th>Ticket Hash</Th>*/}
      {/*        <Th>Pool</Th>*/}
      {/*        <Th isNumeric>Status</Th>*/}
      {/*      </Tr>*/}
      {/*    </Thead>*/}
      {/*    <Tbody>*/}
      {/*      {poolDetails &&*/}
      {/*        sortedTickets.map((ticket) => {*/}
      {/*          return (*/}
      {/*            <Tr key={ticket.txHash}>*/}
      {/*              <Td>{ticket.currentPhase?.slice(-14)}</Td>*/}
      {/*              <Td>*/}
      {/*                <Flex flexWrap="wrap" gap={3}>*/}
      {/*                  {ticket.tickets.map((ticket) => (*/}
      {/*                    <Tag key={ticket}>{ticket}</Tag>*/}
      {/*                  ))}*/}
      {/*                </Flex>*/}
      {/*              </Td>*/}
      {/*              <Td>{poolDetails[ticket.poolCode]?.name}</Td>*/}
      {/*              <Td isNumeric>status</Td>*/}
      {/*            </Tr>*/}
      {/*          );*/}
      {/*        })}*/}
      {/*    </Tbody>*/}
      {/*  </Table>*/}
      {/*</TableContainer>*/}
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
                      {record.isWon == undefined ? (
                        <Countdown targetDate={nextTime(record.pool.period)} />
                      ) : (
                        <Icon
                          as={record.isWon ? GiLaurelsTrophy : FaSadCry}
                          w={8}
                          h={8}
                          color={record.isWon ? "yellow.300" : "red"}
                        />
                      )}
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
