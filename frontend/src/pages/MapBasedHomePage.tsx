/**
 * MapBasedHomePage - Map-first charging point discovery
 * 
 * Features:
 * - Load user's current location via geolocation
 * - Display map with current location marker
 * - Show nearby charging points on map
 * - Click on charger to see details (cost per hour, power level, availability)
 * - Real-time distance and cost calculation
 */

import React, { useState, useEffect } from 'react';
import { MapView } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChargingSearch } from '../hooks/useChargingSearch';
import type { ChargingSearchResponse, ChargingResultItem } from '../types';

export function MapBasedHomePage(): JSX.Element {
  const { coordinates, error: geoError, isLoading: geoLoading } = useGeolocation();
  const { search, isLoading: searchLoading, error: searchError } = useChargingSearch();
  const [searchResults, setSearchResults] = useState<ChargingSearchResponse | null>(null);
  const [selectedCharger, setSelectedCharger] = useState<ChargingResultItem | null>(null);
  const [radius, setRadius] = useState(1000); // meters

  // Auto-search when location is available
  useEffect(() => {
    if (coordinates && !searchLoading) {
      performSearch();
    }
  }, [coordinates]);

  const performSearch = async () => {
    if (!coordinates) return;

    try {
      // Use coordinates directly for search
      const result = await search({
        destination: `${coordinates.latitude},${coordinates.longitude}`,
        battery_percentage: 50,
        radius_meters: radius,
        sort_by: 'cost',
      });

      if (result) {
        setSearchResults(result);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  // Loading states
  if (geoLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Getting your location...</p>
          <p className="text-sm text-gray-500 mt-2">Please enable location access</p>
        </div>
      </div>
    );
  }

  // Error states
  if (geoError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">📍</div>
          <p className="text-gray-700 font-medium">Location Access Required</p>
          <p className="text-sm text-gray-600 mt-2">{geoError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 shadow-lg z-10">
        <h1 className="text-2xl font-bold">ChargePark</h1>
        <p className="text-blue-100 text-sm">Find cheap EV charging near you</p>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        {coordinates && (
          <MapView
            userLocation={{ latitude: coordinates.latitude, longitude: coordinates.longitude }}
            chargers={searchResults?.results || []}
            selectedCharger={selectedCharger}
            onChargerSelect={setSelectedCharger}
          />
        )}

        {/* Radius control panel (floating) */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 w-80">
          <h3 className="font-semibold text-gray-900 mb-3">Search Radius</h3>
          
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={radius}
              onChange={(e) => {
                const newRadius = parseInt(e.target.value);
                handleRadiusChange(newRadius);
              }}
              className="flex-1 cursor-pointer"
            />
            <span className="text-lg font-bold text-blue-600 w-20 text-right">
              {(radius / 1000).toFixed(1)}km
            </span>
          </div>

          <button
            onClick={performSearch}
            disabled={searchLoading}
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition font-medium"
          >
            {searchLoading ? 'Searching...' : 'Search Again'}
          </button>

          {searchResults && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{searchResults.total_results}</strong> chargers found
              </p>
            </div>
          )}

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {searchError}
            </div>
          )}
        </div>

        {/* Charger details panel (if selected) */}
        {selectedCharger && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-6 z-20 max-h-96 overflow-y-auto">
            <button
              onClick={() => setSelectedCharger(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="pr-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {selectedCharger.charger.name}
              </h2>

              <p className="text-sm text-gray-600 mb-4">{selectedCharger.charger.address}</p>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Cost per hour */}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    €{selectedCharger.cost_estimate.cost_per_hour_eur || '0.00'}
                  </p>
                  <p className="text-xs text-gray-600">per hour</p>
                </div>

                {/* Power level */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedCharger.charger.charger_power_kw}kW
                  </p>
                  <p className="text-xs text-gray-600">power</p>
                </div>

                {/* Distance */}
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {(selectedCharger.distance_meters / 1000).toFixed(2)}km
                  </p>
                  <p className="text-xs text-gray-600">away</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connector Types:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCharger.charger.connector_types.join(', ')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCharger.charger.availability_available}/{selectedCharger.charger.availability_total}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">
                    €{selectedCharger.charger.price_per_kwh}/kWh
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCharger.distance_meters}m
                    {selectedCharger.distance_minutes && ` (${selectedCharger.distance_minutes}min walk)`}
                  </span>
                </div>
              </div>

              {/* Action button */}
              <button className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                Navigate to Charger
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info when no charger selected */}
      {!selectedCharger && searchResults && searchResults.total_results === 0 && (
        <div className="absolute bottom-6 left-6 right-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          No chargers found within {(radius / 1000).toFixed(1)}km. Try increasing the search radius.
        </div>
      )}
    </div>
  );
}
