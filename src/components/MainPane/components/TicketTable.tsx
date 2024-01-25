import React from "react";

import { Flex, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import type { PoolType, TicketType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

export const TicketTable: React.FC = () => {
  const { address } = useAccount();

  const { data } = api.user.ticketsList.useQuery(
    { address: address as string },
    { enabled: !!address },
  );
  const { data: poolData } = api.pool.poolList.useQuery();
  const pools = poolData?.result as Array<PoolType>;

  const records = data?.result as Record<string, TicketType>;
  const tickets = Object.values(records ?? {});

  const poolDetails = pools?.reduce(
    (acc, pool) => {
      acc[pool.poolCode] = pool;
      return acc;
    },
    {} as Record<string, PoolType>,
  );
  console.log(tickets);
  const mergeTickets = tickets.reduce(
    (acc, ticket) => {
      console.log("acc", acc);
      const key = ticket.currentPhase + ticket.poolCode;
      if (acc[key]) {
        console.log("concat", ticket.tickets);
        acc[key].tickets = acc[key].tickets.concat(ticket.tickets);
      } else {
        acc[key] = ticket;
      }
      return acc;
    },
    {} as Record<string, TicketType>,
  );

  console.log(mergeTickets);

  const sortedTickets = Object.values(mergeTickets).sort((a, b) =>
    a.currentPhase.slice(-14) > b.currentPhase.slice(-14) ? 1 : -1,
  );
  console.log(sortedTickets);
  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Phase</Th>
              <Th>Ticket Hash</Th>
              <Th>Pool</Th>
              <Th isNumeric>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {poolDetails &&
              sortedTickets.map((ticket) => {
                return (
                  <Tr key={ticket.txHash}>
                    <Td>{ticket.currentPhase?.slice(-14)}</Td>
                    <Td>
                      <Flex flexWrap="wrap" gap={3}>
                        {ticket.tickets.map((ticket) => (
                          <Tag key={ticket}>{ticket}</Tag>
                        ))}
                      </Flex>
                    </Td>
                    <Td>{poolDetails[ticket.poolCode]?.name}</Td>
                    <Td isNumeric>status</Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};
