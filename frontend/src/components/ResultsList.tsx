/**
 * ResultsList component - displays ranked charging results.
 *
 * Features:
 * - List of ChargingCard items
 * - Scrollable container
 * - Empty state
 * - Error handling
 * - Loading state
 * - Mobile-optimized (full width, touch-friendly)
 */

import React from 'react';
import { ChargingCard } from './ChargingCard';
import type { ChargingSearchResponse } from '../types';

interface ResultsListProps {
  response: ChargingSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  onSelectCharger?: (chargerId: string) => void;
}

export function ResultsList({
  response,
  isLoading,
  error,
  onSelectCharger,
}: ResultsListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Searching for charging options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!response || response.total_results === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No charging points found</p>
        <p className="text-gray-400 text-sm">
          Try increasing the search radius or checking a different location
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Results header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-gray-900">
          {response.total_results} Options
        </h2>
        <p className="text-sm text-gray-500">
          Near {response.destination}
        </p>
      </div>

      {/* Results list */}
      <div className="space-y-2">
        {response.results.map((result, index) => (
          <ChargingCard
            key={`${result.charger.id}-${index}`}
            result={result}
            index={index}
            onSelectCharger={onSelectCharger}
          />
        ))}
      </div>

      {/* Results info footer */}
      <div className="text-xs text-gray-500 text-center py-3 border-t border-gray-200 mt-4">
        <p>
          Updated {new Date(response.search_timestamp).toLocaleTimeString()}
        </p>
        <p className="mt-1">
          Prices vary by provider. Contact for confirmation.
        </p>
      </div>
    </div>
  );
}
