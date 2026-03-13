import { useCallback, useEffect, useState } from "react";

import { listPortfolios } from "../../../api/portfolios";
import type { Portfolio } from "../../../types/portfolio";

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPortfolios();
      setPortfolios(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load portfolios.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    portfolios,
    isLoading,
    error,
    reload: load,
  };
}
