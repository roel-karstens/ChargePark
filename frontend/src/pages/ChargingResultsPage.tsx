/**
 * ResultsPage - Shows search results with map and list views.
 *
 * Features:
 * - Searchable results list
 * - Interactive map view
 * - Toggle between map and list
 * - Detail modal for selected charger
 * - Back to search button
 * - Mobile-optimized layout
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResultsList } from '../components/ResultsList';
import { MapView } from '../components/MapView';
import { DetailModal } from '../components/DetailModal';
import type { ChargingSearchResponse, ChargingResultItem } from '../types';

interface LocationState {
  searchResponse: ChargingSearchResponse;
}

type ViewMode = 'list' | 'map';

export function ResultsPage(): JSX.Element {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null);

  // Fallback if user navigates directly without search result
  if (!state?.searchResponse) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">
          No search results found
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const response = state.searchResponse;
  const selectedResult = response.results.find(
    (r) => r.charger.id === selectedChargerId,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← New Search
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Results
          </h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* View toggle (mobile: list/map, desktop: both) */}
        <div className="flex gap-2 mb-4 sm:hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            🗺️ Map
          </button>
        </div>

        {/* Desktop layout: map + list side by side */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6">
          {/* Map (left side, takes 1 column on tablet, 2 on desktop) */}
          <div className="sm:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Map View
            </h2>
            <MapView
              response={response}
              selectedChargerId={selectedChargerId}
              onSelectCharger={setSelectedChargerId}
            />
          </div>

          {/* List (right side, takes 2 columns) */}
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Results by Cost
            </h2>
            <ResultsList
              response={response}
              isLoading={false}
              error={null}
              onSelectCharger={setSelectedChargerId}
            />
          </div>
        </div>

        {/* Mobile layout: toggle between list and map */}
        {viewMode === 'list' && (
          <div className="sm:hidden">
            <ResultsList
              response={response}
              isLoading={false}
              error={null}
              onSelectCharger={setSelectedChargerId}
            />
          </div>
        )}

        {viewMode === 'map' && (
          <div className="sm:hidden">
            <MapView
              response={response}
              selectedChargerId={selectedChargerId}
              onSelectCharger={setSelectedChargerId}
            />
          </div>
        )}

        {/* Detail modal */}
        {selectedResult && (
          <DetailModal
            result={selectedResult}
            onClose={() => setSelectedChargerId(null)}
          />
        )}
      </div>
    </div>
  );
}
