// components/MainPane.tsx
import { type FC } from "react";

import { Box, Heading, Spinner } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { TicketCard } from "@/components/MainPane/components/TicketCard";
import type { MyTicketType } from "@/server/lib/LotteryTypes";
import styles from "@/styles/mainPane.module.css";
import { api } from "@/trpc/react";

const TicketList: FC = () => {
  const { isConnected } = useAccount();
  const { address } = useAccount();

  const { data, isLoading } = api.user.ticketsList.useQuery(
    { address: address as string },
    { enabled: !!address },
  );

  const records = data?.result as Record<string, MyTicketType>;
  const tickets = Object.values(records ?? {});
  tickets?.sort((a, b) => b.currentPhase.localeCompare(a.currentPhase));

  return (
    <Box className={styles.container}>
      <Heading as="h2" fontSize={"2rem"} mb={10} className="text-shadow">
        Your Tickets
      </Heading>

      {isConnected ? (
        <>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <Spinner color="#F8EF00" />
            </Box>
          ) : (
            <>
              <Box display="flex" flexDirection="column" alignItems="center" gap={6}>
                {tickets.map((record) => {
                  return (
                    <TicketCard {...record} key={`ticket-${record.currentPhase}`}></TicketCard>
                  );
                })}
              </Box>
            </>
          )}
        </>
      ) : (
        <Box height={300} display="flex" alignItems="center" justifyContent="center">
          <ConnectButton />
        </Box>
      )}
    </Box>
  );
};

export default TicketList;
