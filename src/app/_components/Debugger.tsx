"use client";

import { type FC } from "react";

import { Box, Divider, Flex, Heading } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import LotteryMain from "@/app/_components/LotteryMain";
import styles from "@/styles/mainPane.module.css";

const Debugger: FC = () => {
  const { isConnected } = useAccount();

  return (
    <Box className={styles.container}>
      <Heading as="h2" fontSize={"2rem"} mb={10} className="text-shadow">
        Display Info
      </Heading>

      <Flex className={styles.content}>
        {isConnected && (
          <>
            <LotteryMain />
            <Divider mb={5} />
            <Flex
              w={"100%"}
              display={"flex"}
              justifyContent={"space-around"}
              flexWrap={"wrap"}
              gap={5}
            ></Flex>
          </>
        )}
      </Flex>
    </Box>
  );
};
export default Debugger;
