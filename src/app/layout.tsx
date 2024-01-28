import React, { type ReactNode } from "react";

import "@/styles/globals.css";
import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PEVL",
  applicationName: "PEVL Fair Lottery",
  description: "A 100% verifible onchain lottery that is EV+",
  authors: {
    name: "PEVL Team",
    url: "pevl.xyz",
  },
  themeColor: "dark",
  viewport: "width=device-width, initial-scale=1",
  icons: "favicon.ico",
  manifest: "site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider cookies={cookies().toString()}>
          <Providers>{children}</Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
