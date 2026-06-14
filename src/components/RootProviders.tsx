import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SystemHealthProvider } from "./SystemHealthProvider";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

interface RootProvidersProps {
  children: ReactNode;
}

export const RootProviders = ({ children }: RootProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SystemHealthProvider>{children}</SystemHealthProvider>
    </QueryClientProvider>
  );
};
