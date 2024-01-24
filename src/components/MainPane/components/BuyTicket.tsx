import { type FC } from "react";

import { Box, Grid, GridItem, Text } from "@chakra-ui/react";

import { PoolCard } from "@/components/MainPane/components/PoolCard";
import type { PoolStateType } from "@/server/lib/LotteryService";
import { api } from "@/trpc/react";

const BuyTicket: FC = () => {
  const { data: poolData } = api.pool.poolStateList.useQuery();
  const pools = poolData?.result as Array<PoolStateType>;
  console.log(pools);
  return (
    <Box p={{ xs: 2, sm: 4 }}>
      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
        {pools?.map((pool) => (
          <GridItem key={pool.pool.name} w="100%">
            <PoolCard {...pool} />
          </GridItem>
        ))}
      </Grid>
      <Text color="red">
        Please avoid refreshing or clicking anything until the success dialog appears, to ensure
        your ticket is secured.
      </Text>
    </Box>
  );
};

export default BuyTicket;
