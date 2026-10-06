/**
 * ChargingCard component - displays a single charging result.
 *
 * Features:
 * - Charger details (name, address, power)
 * - Cost breakdown with confidence indicator
 * - Time and distance estimates
 * - Availability status
 * - Click to view details
 * - Mobile-optimized layout
 */

import React from 'react';
import type { ChargingResultItem } from '../types';

interface ChargingCardProps {
  result: ChargingResultItem;
  onSelectCharger?: (chargerId: string) => void;
  index: number;
}

export function ChargingCard({
  result,
  onSelectCharger,
  index,
}: ChargingCardProps): JSX.Element {
  const { charger, cost_estimate, distance_meters, distance_minutes, total_time_minutes } = result;

  // Determine confidence badge color
  const getConfidenceBadge = () => {
    switch (cost_estimate.cost_confidence) {
      case 'exact':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Exact Price' };
      case 'estimated':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Estimated' };
      case 'unknown':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
    }
  };

  const confidence = getConfidenceBadge();

  return (
    <button
      onClick={() => onSelectCharger?.(charger.id)}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition active:bg-gray-50"
      type="button"
      aria-label={`Charger ${index + 1}: ${charger.name}`}
    >
      {/* Header: Ranking badge + Name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white text-sm font-bold rounded-full">
            {index + 1}
          </span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {charger.name}
            </h3>
            <p className="text-xs text-gray-500">
              {charger.address}
            </p>
          </div>
        </div>

        {/* Confidence badge */}
        <span
          className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${confidence.bg} ${confidence.text}`}
        >
          {confidence.label}
        </span>
      </div>

      {/* Main metrics row: Cost, Time, Distance */}
      <div className="grid grid-cols-3 gap-2 mb-3 py-3 border-t border-b border-gray-200">
        {/* Cost */}
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            €{cost_estimate.total_cost_eur}
          </div>
          <div className="text-xs text-gray-500">
            Cost
          </div>
        </div>

        {/* Time */}
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {total_time_minutes}
          </div>
          <div className="text-xs text-gray-500">
            Minutes
          </div>
        </div>

        {/* Distance */}
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {distance_meters}
          </div>
          <div className="text-xs text-gray-500">
            Meters
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="space-y-2 text-sm">
        {/* Power and connectors */}
        {charger.charger_power_kw && (
          <div className="flex justify-between">
            <span className="text-gray-600">Power:</span>
            <span className="font-medium text-gray-900">
              {charger.charger_power_kw} kW
            </span>
          </div>
        )}

        {/* Connector types */}
        {charger.connector_types.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Connectors:</span>
            <span className="font-medium text-gray-900">
              {charger.connector_types.join(', ')}
            </span>
          </div>
        )}

        {/* Availability */}
        <div className="flex justify-between">
          <span className="text-gray-600">Available:</span>
          <span
            className={`font-medium ${
              charger.availability_available > 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {charger.availability_available} / {charger.availability_total}
          </span>
        </div>

        {/* Time breakdown */}
        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
          <span>
            Charging: {cost_estimate.charging_time_minutes} min
            {distance_minutes && ` + Walking: ${distance_minutes} min`}
          </span>
        </div>
      </div>

      {/* CTA hint */}
      <div className="mt-3 text-center text-xs text-blue-600 font-medium">
        Tap for details →
      </div>
    </button>
  );
}
