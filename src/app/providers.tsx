"use client";
import { type ReactNode, useState, useEffect } from "react";

import { CacheProvider } from "@chakra-ui/next-js";
import { extendTheme, ChakraProvider, Flex, Box, DarkMode } from "@chakra-ui/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";

import { Footer, Header } from "@/components";
import { useWindowSize } from "@/hooks";
import { chains, config } from "@/wagmi";
import "@fontsource/orbitron";
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isTablet } = useWindowSize();

  useEffect(() => setMounted(true), []);

  const theme = extendTheme({
    initialColorMode: "dark",
    useSystemColorMode: false,
    fonts: {
      heading: `'Orbitron', sans-serif`,
      body: `'Otbitron', sans-serif`,
    },
    global: {
      // styles for the `body`
      body: {
        bg: "black",
        color: "white",
      },
    },
    colors: {
      brand: {
        100: "#F8EF00",
        200: "#F8EF00",
        300: "#F8EF00",
        400: "#F8EF00",
        500: "#F8EF00",
        600: "#F8EF00",
        700: "#F8EF00",
        800: "#F8EF00",
        900: "#F8EF00",
      },
    },
  });

  const appInfo = {
    appName: "PEVL",
  };

  return (
    <WagmiConfig config={config}>
      <CacheProvider>
        <ChakraProvider theme={theme}>
          <RainbowKitProvider coolMode chains={chains} appInfo={appInfo}>
            <DarkMode>
              {mounted && (
                <Flex
                  flexDirection="column"
                  minHeight={isTablet ? "calc(100vh - 80px)" : "100vh"}
                  pb={20}
                >
                  <Header />

                  <Box as="main" flex={1} p={4}>
                    {children}
                  </Box>

                  {isTablet && <Footer />}
                </Flex>
              )}
            </DarkMode>
          </RainbowKitProvider>
        </ChakraProvider>
      </CacheProvider>
    </WagmiConfig>
  );
}
