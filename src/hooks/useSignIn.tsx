import { useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";

import { api } from "@/trpc/react";

export function useSignIn() {
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  api.user.signIn.useQuery({
    address: address ?? null,
    referral: searchParams.get("referral") ?? undefined,
  });
  useEffect(() => {
    console.log("useSignIn");
  }, [address, isConnected]);
  return { address };
}
