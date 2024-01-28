"use client";

import { Box, Center } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import Airdrop from "@/app/_components/airdrop/Airdrop";
import styles from "@/styles/mainPane.module.css";

export default function Referral() {
  const { isConnected } = useAccount();
  return (
    <>
      <Box className={styles.container}>
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
