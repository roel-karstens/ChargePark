/**
 * Custom hook for managing loading and error state.
 * Avoids repeating the same state management pattern across components.
 */

import { useState } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  setLoading: (state: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for managing loading and error states.
 * 
 * @returns Object with isLoading, error, and setter functions
 */
export function useLoadingState(): LoadingState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    isLoading,
    error,
    setLoading: setIsLoading,
    setError,
  };
}
