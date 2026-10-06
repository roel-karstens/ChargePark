/**
 * Custom hook for geocoding (address search) API integration.
 *
 * Handles:
 * - Autocomplete search state
 * - API calls to /api/v1/geocode/search
 * - Debouncing (caller should implement if needed)
 */

import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { GeocodeResult, GeocodeSearchResponse } from '../types';

interface UseGeocodingState {
  results: GeocodeResult[];
  isLoading: boolean;
  error: string | null;
}

export function useGeocoding() {
  const [state, setState] = useState<UseGeocodingState>({
    results: [],
    isLoading: false,
    error: null,
  });

  const search = useCallback(
    async (query: string, limit: number = 5): Promise<GeocodeResult[]> => {
      if (query.trim().length < 2) {
        setState({ results: [], isLoading: false, error: null });
        return [];
      }

      setState({ results: [], isLoading: true, error: null });

      try {
        const response = await api.get<GeocodeSearchResponse>(
          `/api/v1/geocode/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        );

        setState({
          results: response.results,
          isLoading: false,
          error: null,
        });

        return response.results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Geocoding failed';
        setState({
          results: [],
          isLoading: false,
          error: errorMessage,
        });
        return [];
      }
    },
    [],
  );

  const clearResults = useCallback(() => {
    setState({ results: [], isLoading: false, error: null });
  }, []);

  return {
    ...state,
    search,
    clearResults,
  };
}
