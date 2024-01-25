"use client";

import { Box, Center, useColorMode } from "@chakra-ui/react";

import Airdrop from "@/app/_components/airdrop/Airdrop";
import styles from "@/styles/mainPane.module.css";

export default function Referral() {
  const { colorMode } = useColorMode();
  return (
    <>
      <Box
        className={styles.container}
        border={colorMode === "light" ? "none" : "1px solid rgba(152, 161, 192, 0.24)"}
      >
        <Center>
          <Airdrop />
        </Center>
      </Box>
    </>
  );
}
