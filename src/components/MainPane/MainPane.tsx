// components/MainPane.tsx
import { type FC } from "react";

import { Box, Center, Heading } from "@chakra-ui/react";

// import LotteryMain from "@/app/_components/LotteryMain";
import styles from "@/styles/mainPane.module.css";

import { BuyTicket } from "./components";

const MainPane: FC = () => {
  return (
    <Box className={styles.container}>
      <Heading as="h2" fontSize={"2rem"} mb={10} className="text-shadow">
        Play our 100% payout raffle!!
      </Heading>
      <Center>
        <BuyTicket />
      </Center>

      {/* {isConnected ? : <ConnectButton />} */}
      {/* <LotteryMain /> */}
    </Box>
  );
};

export default MainPane;
