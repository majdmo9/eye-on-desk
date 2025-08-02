// hooks/useHydrationSafe.ts
import { useEffect, useState } from "react";

/**
 * Hook to prevent hydration mismatches by ensuring server and client render the same initially
 */
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

export function useClientOnly<T>(clientOnlyFn: () => T, fallback: T): T {
  const isHydrated = useHydrationSafe();
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    if (isHydrated) {
      setValue(clientOnlyFn());
    }
  }, [isHydrated, clientOnlyFn]);

  return isHydrated ? value : fallback;
}
