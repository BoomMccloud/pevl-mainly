import { type FC } from "react";

import { Box, Grid, GridItem, Spinner, Text } from "@chakra-ui/react";

import { PoolCard } from "@/components/MainPane/components/PoolCard";
import type { PoolStateType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

const BuyTicket: FC = () => {
  const { data: poolData, isLoading } = api.pool.poolStateList.useQuery();
  const pools = poolData?.result as Array<PoolStateType>;

  return (
    <Box p={{ xs: 2, sm: 4 }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Spinner color="yellow" />
        </Box>
      ) : (
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]} gap={6} mb={6}>
          {pools?.map((pool) => (
            <GridItem key={pool.pool.name} w="100%">
              <PoolCard {...pool} />
            </GridItem>
          ))}
        </Grid>
      )}
      <Text color="red">
        Don&apos;t refresh or navigate away from this page until you see the confirmation message.
      </Text>
      <Text>
        Testnet PEVL points can win real Blast points. The raffle is verifiably random{" "}
        <a href="https://pevl.gitbook.io/pevl/our-games/daily-raffle"> (Learn more).</a>
      </Text>
    </Box>
  );
};

export default BuyTicket;
