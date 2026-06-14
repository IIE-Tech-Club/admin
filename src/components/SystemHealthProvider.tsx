import { ReactNode, useEffect } from "react";
import {
  useSystemHealthMonitor,
  validateSystemIntegrity,
} from "../hooks/useSystemHealth";

interface SystemHealthProviderProps {
  children: ReactNode;
}

export const SystemHealthProvider = ({
  children,
}: SystemHealthProviderProps) => {
  const { data: healthData, isLoading, error } = useSystemHealthMonitor();

  useEffect(() => {
    const isValid = validateSystemIntegrity(healthData);

    if (!isValid && !isLoading && healthData) {
      console.error("System integrity check failed");
    }
  }, [healthData, isLoading]);

  // Render children regardless of health status to prevent layout crashes
  // but maintain the integrity check in the background
  return <>{children}</>;
};
