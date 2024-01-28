import { Box } from "@chakra-ui/react";
import styled from "@emotion/styled";

export const Container = styled(Box)`
  --clip: 10px;
  background-color: #181811;
  clip-path: polygon(
    /* top left */ 0% var(--clip),
    var(--clip) 0%,

    /* top clip */ 60% 0%,
    62% var(--clip),
    78% var(--clip),
    80% 0%,
    /* top right */ calc(100% - var(--clip)) 0%,
    100% var(--clip),
    /* right clip */ 100% 60%,
    calc(100% - var(--clip)) 62%,
    calc(100% - var(--clip)) 78%,
    100% 80%,
    /* bottom right */ 100% calc(100% - var(--clip)),
    calc(100% - var(--clip)) 100%,

    /* bottom clip */ 40% 100%,
    38% calc(100% - var(--clip)),
    22% calc(100% - var(--clip)),
    20% 100%,
    /* bottom left */ var(--clip) 100%,
    0% calc(100% - var(--clip)),
    /* left clip */ 0% 40%,
    var(--clip) 38%,
    var(--clip) 22%,
    0% 20%
  );

  padding: 24px 32px;
`;
