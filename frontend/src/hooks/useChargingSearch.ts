/**
 * Custom hook for charging search API integration.
 *
 * Handles:
 * - Search state (loading, error, results)
 * - API calls to /api/v1/charging/search
 * - Result caching
 */

import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { ChargingSearchRequest, ChargingSearchResponse } from '../types';

interface UseChargingSearchState {
  data: ChargingSearchResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useChargingSearch() {
  const [state, setState] = useState<UseChargingSearchState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const search = useCallback(
    async (request: ChargingSearchRequest): Promise<ChargingSearchResponse | null> => {
      setState({ data: null, isLoading: true, error: null });

      try {
        const response = await api.post<ChargingSearchResponse>(
          '/api/v1/charging/search',
          {
            destination: request.destination,
            battery_percentage: request.battery_percentage,
            radius_meters: request.radius_meters ?? 500,
            sort_by: request.sort_by ?? 'cost',
          },
        );

        setState({
          data: response,
          isLoading: false,
          error: null,
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    search,
    reset,
  };
}
