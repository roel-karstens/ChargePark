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
      console.log('Auto-searching from coordinates:', coordinates);
      performSearch();
    }
  }, [coordinates, searchLoading]);

  const performSearch = async () => {
    if (!coordinates) {
      console.warn('performSearch called but no coordinates available');
      return;
    }

    console.log('Performing search with coordinates:', coordinates, 'radius:', radius);

    try {
      // Use coordinates directly for search
      const result = await search({
        destination: `${coordinates.latitude},${coordinates.longitude}`,
        battery_percentage: 50,
        radius_meters: radius,
        sort_by: 'cost',
      });

      console.log('Search result:', result);

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
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-4 shadow-lg z-10">
        <h1 className="text-2xl font-bold">ChargePark</h1>
        <p className="text-slate-300 text-sm">Find nearby EV charging</p>
        <p className="text-xs text-slate-400 mt-1">Chargers: {searchResults?.results?.length || 0} | Coordinates: {coordinates ? `${coordinates.latitude.toFixed(2)},${coordinates.longitude.toFixed(2)}` : 'none'}</p>
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

        {/* Radius control panel (floating) - always visible */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 w-72 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">Search Radius</h3>
          
          <div className="flex items-center gap-3">
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
              className="flex-1 cursor-pointer h-2"
            />
            <span className="text-base font-bold text-slate-700 w-16 text-right">
              {(radius / 1000).toFixed(1)}km
            </span>
          </div>

          <button
            onClick={performSearch}
            disabled={searchLoading}
            className="w-full mt-3 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition font-medium text-sm"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>

          {searchResults && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">{searchResults.total_results}</strong> chargers found
              </p>
            </div>
          )}

          {searchError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {searchError}
            </div>
          )}
        </div>

        {/* Charger details panel (bottom sheet) - prominent price display */}
        {selectedCharger && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-slate-700 rounded-t-3xl shadow-2xl p-6 z-30 max-h-96 overflow-y-auto">
            <button
              onClick={() => setSelectedCharger(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
            >
              ✕
            </button>

            <div className="pr-8">
              {/* Station Name */}
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {selectedCharger.charger.name}
              </h2>
              <p className="text-sm text-slate-600 mb-4">{selectedCharger.charger.address}</p>

              {/* PRICE - VERY PROMINENT */}
              <div className="mb-6 p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300">
                <p className="text-sm text-slate-600 font-semibold mb-1">Hourly Charge Cost</p>
                <p className="text-5xl font-bold text-slate-900">
                  €{selectedCharger.cost_estimate.cost_per_hour_eur || '0.00'}
                </p>
                <p className="text-sm text-slate-600 mt-1">/hour</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Power level */}
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-700">
                    {selectedCharger.charger.charger_power_kw}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">kW power</p>
                </div>

                {/* Distance */}
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-700">
                    {(selectedCharger.distance_meters / 1000).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">km away</p>
                </div>

                {/* Walking time */}
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-700">
                    {selectedCharger.distance_minutes || '-'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">min walk</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Price per kWh:</span>
                  <span className="font-semibold text-slate-900">
                    €{selectedCharger.charger.price_per_kwh}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Connector Types:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedCharger.charger.connector_types.join(', ')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Available:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedCharger.charger.availability_available}/{selectedCharger.charger.availability_total}
                  </span>
                </div>
              </div>

              {/* Action button */}
              <button className="w-full mt-6 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-semibold">
                Navigate to Charger
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info when no charger selected */}
      {!selectedCharger && searchResults && searchResults.total_results === 0 && (
        <div className="absolute bottom-6 left-6 right-6 bg-slate-50 border border-slate-300 rounded-lg p-4 text-sm text-slate-700">
          No chargers found within {(radius / 1000).toFixed(1)}km. Try increasing the search radius.
        </div>
      )}
    </div>
  );
}
