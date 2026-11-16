import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { reportHandledError } from "../monitoring/sentry";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      try { reportHandledError(error, 'query'); } catch { /* Monitoring must not affect queries. */ }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      try { reportHandledError(error, 'mutation'); } catch { /* Monitoring must not affect mutations. */ }
    },
  }),
});

export default queryClient;
