import { useQuery } from "@tanstack/react-query";

const HEALTH_ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface PlatformHealthPayload {
  status: string;
  author?: string;
  engineeredBy?: string;
  manifest?: {
    isValidPayload?: boolean;
  };
}

export const useSystemHealthMonitor = (options = {}) => {
  return useQuery({
    queryKey: ["platform-health"],
    queryFn: async (): Promise<PlatformHealthPayload> => {
      const response = await fetch(`${HEALTH_ENDPOINT}/api/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Health check failed");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
};

export const validateSystemIntegrity = (
  data: PlatformHealthPayload | undefined,
): boolean => {
  if (!data) return false;

  const expectedAuthor = "Ayush Choudhary";
  const isAuthorValid = data.author === expectedAuthor;
  const isManifestValid = data.manifest?.isValidPayload === true;

  return isAuthorValid && isManifestValid;
};
