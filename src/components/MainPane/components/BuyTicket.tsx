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
        Please avoid refreshing or clicking anything until the success dialog appears, to ensure
        your ticket is secured.
      </Text>
    </Box>
  );
};

export default BuyTicket;
