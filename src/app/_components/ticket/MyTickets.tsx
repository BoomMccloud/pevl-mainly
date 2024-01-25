"use client";

import React from "react";

import {
  Box,
  Divider,
  Heading,
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
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import moment from "moment/moment";
import { FaSadCry } from "react-icons/fa";
import { GiLaurelsTrophy } from "react-icons/gi";
import { useAccount } from "wagmi";

import { nextTime } from "@/app/_util/util";
import type { MyTicketType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

import Countdown from "../Countdown";

function MyTickets() {
  const { address } = useAccount();

  const { data } = api.user.ticketsList.useQuery({ address: address ?? "alec-test-address" });
  const records = data?.result as Record<string, MyTicketType>;
  const tickets = Object.values(records ?? {});
  tickets?.sort((a, b) => a.currentPhase.localeCompare(b.currentPhase));
  console.log(records);
  return (
    <Box>
      <Heading as="h2" fontSize={"1.5rem"} mb={10} className="text-shadow">
        My Raffles List
      </Heading>
      <TableContainer>
        <Table variant="striped">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>Phase</Th>
              <Th>Bet</Th>
              <Th>Prize Pool</Th>
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
      <Divider mb={5} />
    </Box>
  );
}

export default MyTickets;
