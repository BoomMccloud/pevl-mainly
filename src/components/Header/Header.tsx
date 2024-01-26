"use client";
import { type FC } from "react";

import { CheckCircleIcon, SettingsIcon, StarIcon, UnlockIcon } from "@chakra-ui/icons";
import { Button, HStack } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "public/img/logo-with-text-transparent.svg";

import { useWindowSize } from "@/hooks/useWindowSize";

export const ticketPath = "/tickets";

export const routes = [
  {
    title: "Games",
    path: "/",
    icon: <StarIcon />,
  },
  {
    title: "Tickets",
    path: ticketPath,
    icon: <CheckCircleIcon />,
  },
  {
    title: "Airdrops",
    path: "/referrals",
    icon: <SettingsIcon />,
  },

  ...(process.env.NODE_ENV === "development"
    ? [
        {
          title: "Debugger",
          path: "/debugger",
          icon: <UnlockIcon />,
        },
      ]
    : []),
];

const Header: FC = () => {
  const { isTablet } = useWindowSize();
  const router = useRouter();

  return (
    <HStack
      as="header"
      p={"1.5rem"}
      position="sticky"
      top={0}
      zIndex={10}
      justifyContent={"space-between"}
    >
      <HStack>
        <Image src={logo.src} alt="logo" width={132} height={48} />
        {!isTablet && (
          <>
            {routes.map((route) => {
              return (
                <Button
                  key={route.path}
                  variant="ghost"
                  onClick={() => {
                    router.push(route.path);
                  }}
                  className="custom-button"
                >
                  {route.title}
                </Button>
              );
            })}
          </>
        )}
      </HStack>

      <HStack>
        <ConnectButton />
        {/* <DarkModeButton /> */}
      </HStack>
    </HStack>
  );
};

export default Header;
