/**
 * HomePage - Main search page for charging point lookup.
 *
 * Features:
 * - Destination search (with autocomplete)
 * - Battery percentage slider
 * - Search button
 * - Loading state
 * - Error handling
 * - Mobile-first layout
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { BatterySlider } from '../components/BatterySlider';
import { useBattery } from '../hooks/useBattery';
import { useChargingSearch } from '../hooks/useChargingSearch';
import type { GeocodeResult, ChargingSearchRequest } from '../types';

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const { battery, setBattery } = useBattery();
  const { search, isLoading, error } = useChargingSearch();
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSelectLocation = (location: GeocodeResult) => {
    setSelectedLocation(location);
    setSearchError(null);
  };

  const handleSearch = async () => {
    if (!selectedLocation) {
      setSearchError('Please select a destination');
      return;
    }

    const request: ChargingSearchRequest = {
      destination: selectedLocation.name,
      battery_percentage: battery,
      radius_meters: 500,
      sort_by: 'cost',
    };

    const result = await search(request);
    if (result) {
      // Navigate to results page with data
      navigate('/results', {
        state: {
          searchResponse: result,
          selectedLocation,
          battery,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            ChargePark
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Find the cheapest EV charging near your destination
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          {/* Step 1: Destination */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              1. Where are you going?
            </label>
            <SearchBar
              onSelect={handleSelectLocation}
              disabled={isLoading}
            />
            {selectedLocation && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  ✓ {selectedLocation.name}
                </p>
                <p className="text-xs text-green-700">
                  {selectedLocation.address}
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Battery level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              2. What's your battery level?
            </label>
            <BatterySlider
              value={battery}
              onChange={setBattery}
              disabled={isLoading}
            />
          </div>

          {/* Summary */}
          {selectedLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">You'll find:</span><br/>
                Charging options near <strong>{selectedLocation.name}</strong> <br/>
                for a <strong>{battery}%</strong> charged EV
              </p>
            </div>
          )}

          {/* Errors */}
          {(searchError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                {searchError || error}
              </p>
            </div>
          )}

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!selectedLocation || isLoading}
            className={`w-full py-4 px-4 rounded-lg font-semibold text-base transition h-14 ${
              !selectedLocation || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Searching...
              </span>
            ) : (
              'Search Charging Options'
            )}
          </button>
        </div>

        {/* Info section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 mb-1">💰</div>
            <p className="text-sm text-gray-700 font-medium">
              Cost Optimized
            </p>
            <p className="text-xs text-gray-500">
              Cheapest option first
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 mb-1">🗺️</div>
            <p className="text-sm text-gray-700 font-medium">
              Location Based
            </p>
            <p className="text-xs text-gray-500">
              Real walking distance
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 mb-1">⚡</div>
            <p className="text-sm text-gray-700 font-medium">
              Real Time Data
            </p>
            <p className="text-xs text-gray-500">
              Prices updated live
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500 pb-4">
          <p>
            Charging data from NDW Open Data • 
            Locations from OpenStreetMap
          </p>
        </div>
      </div>
    </div>
  );
}
