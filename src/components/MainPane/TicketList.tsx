// components/MainPane.tsx
import { type FC } from "react";

import { Box, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { TicketTable } from "@/components/MainPane/components/TicketTable";
import styles from "@/styles/mainPane.module.css";

const TicketList: FC = () => {
  const { isConnected } = useAccount();

  return (
    <Box className={styles.container}>
      <Heading as="h2" fontSize={"2rem"} mb={10} className="text-shadow">
        Your Tickets
      </Heading>

      {isConnected ? (
        <TicketTable />
      ) : (
        <Box height={300} display="flex" alignItems="center" justifyContent="center">
          <ConnectButton />
        </Box>
      )}
    </Box>
  );
};

export default TicketList;
