/**
 * DetailModal component - full details of a selected charger.
 *
 * Features:
 * - Modal overlay
 * - Full charger information
 * - Cost and time breakdown
 * - Close button
 * - Accessibility features (ARIA, keyboard dismiss)
 * - Mobile-optimized
 */

import React, { useEffect } from 'react';
import type { ChargingResultItem } from '../types';

interface DetailModalProps {
  result: ChargingResultItem | null;
  onClose: () => void;
}

export function DetailModal({ result, onClose }: DetailModalProps): JSX.Element | null {
  if (!result) return null;

  const { charger, cost_estimate, distance_meters, distance_minutes, total_time_minutes } = result;

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${charger.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {charger.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Location
            </h3>
            <p className="text-base text-gray-900">
              {charger.address}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {parseFloat(charger.latitude).toFixed(4)}°N, {parseFloat(charger.longitude).toFixed(4)}°E
            </p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                €{cost_estimate.total_cost_eur}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Cost
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {total_time_minutes}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Minutes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {distance_meters}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Meters
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Cost Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Battery needed:</span>
                <span className="font-medium text-gray-900">
                  {cost_estimate.battery_kwh} kWh
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per kWh:</span>
                <span className="font-medium text-gray-900">
                  {charger.price_per_kwh ? `€${charger.price_per_kwh}` : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-b border-gray-200">
                <span className="text-gray-600 font-medium">Total cost:</span>
                <span className="font-bold text-green-600">
                  €{cost_estimate.total_cost_eur}
                </span>
              </div>
              <div className="text-xs text-gray-500 pt-2">
                <span
                  className={
                    cost_estimate.cost_confidence === 'exact'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }
                >
                  {cost_estimate.cost_confidence === 'exact'
                    ? '✓ Exact price from provider'
                    : '⚠ Estimated based on average pricing'}
                </span>
              </div>
            </div>
          </div>

          {/* Time breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Time Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Charging time:</span>
                <span className="font-medium text-gray-900">
                  {cost_estimate.charging_time_minutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Walking time:</span>
                <span className="font-medium text-gray-900">
                  {distance_minutes || 'Unknown'} {distance_minutes ? 'minutes' : ''}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-b border-gray-200">
                <span className="text-gray-600 font-medium">Total time:</span>
                <span className="font-bold text-blue-600">
                  {total_time_minutes} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Charger details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Charger Details
            </h3>
            <div className="space-y-2 text-sm">
              {charger.charger_power_kw && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Power output:</span>
                  <span className="font-medium text-gray-900">
                    {charger.charger_power_kw} kW
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Connectors:</span>
                <span className="font-medium text-gray-900">
                  {charger.connector_types.length > 0
                    ? charger.connector_types.join(', ')
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total connectors:</span>
                <span className="font-medium text-gray-900">
                  {charger.num_connectors || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currently available:</span>
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
            </div>
          </div>

          {/* Data disclaimer */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p>
              ⓘ Data updated {new Date(charger.last_updated).toLocaleString()}. 
              Prices and availability may change. Please contact the provider for confirmation.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition"
            >
              Close
            </button>
            <a
              href={`https://maps.google.com/?q=${charger.latitude},${charger.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-center"
            >
              Navigate →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
