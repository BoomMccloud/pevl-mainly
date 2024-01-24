"use client";

import React from "react";

import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
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
import moment from "moment";
import { GiLaurelsTrophy } from "react-icons/gi";
import { useAccount } from "wagmi";

import type { TicketType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

function MyTickets() {
  const { address } = useAccount();

  const { data } = api.user.ticketsList.useQuery({ address: address ?? "alec-test-address" });
  const records = data?.result as Record<string, TicketType>;
  const tickets = Object.values(records ?? {});
  tickets?.sort((a, b) => a.txTime - b.txTime);

  return (
    <Box>
      <Heading as="h2" fontSize={"1.5rem"} mb={10} className="text-shadow">
        My Ticket List
      </Heading>
      <TableContainer overflowX={"scroll"}>
        <Table variant="striped">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>Phase</Th>
              <Th>Tickets</Th>
              <Th>View</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(records ?? {}).map((key) => {
              return (
                <Tr key={`ticket-${key}`}>
                  <Td>
                    <Popover>
                      <PopoverTrigger>
                        <Tag bg="blue.300">
                          {records[key].currentPhase?.slice(-14)}
                          <ViewIcon />
                        </Tag>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>{key}!</PopoverHeader>
                        <PopoverBody>
                          <Box>{records[key].poolCode}</Box>
                          <Box>{moment(records[key].txTime).format("YYYY-MM-DD HH:mm:ss")}</Box>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Td>
                  <Td>
                    {records[key].tickets.map((t) => {
                      return (
                        <Tag bg="green.300" key={t}>
                          {t}
                        </Tag>
                      );
                    })}
                  </Td>
                  <Td>
                    <GiLaurelsTrophy color={"gold"} size={30} />
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
