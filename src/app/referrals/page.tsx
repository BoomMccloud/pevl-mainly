"use client";

import { Box, Center, useColorMode } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import Airdrop from "@/app/_components/airdrop/Airdrop";
import styles from "@/styles/mainPane.module.css";

export default function Referral() {
  const { colorMode } = useColorMode();
  const { isConnected } = useAccount();
  return (
    <>
      <Box
        className={styles.container}
        border={colorMode === "light" ? "none" : "1px solid rgba(152, 161, 192, 0.24)"}
      >
        <Center>
          {isConnected ? (
            <Airdrop />
          ) : (
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <ConnectButton />
            </Box>
          )}
        </Center>
      </Box>
    </>
  );
}
