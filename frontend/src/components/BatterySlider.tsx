/**
 * BatterySlider component - adjust current battery percentage.
 *
 * Features:
 * - Range slider (0-100%)
 * - Visual battery indicator
 * - Touch-friendly (48px+ height)
 * - Keyboard accessible
 * - Shows percentage value
 */

import React from 'react';

interface BatterySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function BatterySlider({
  value,
  onChange,
  disabled = false,
}: BatterySliderProps): JSX.Element {
  // Color changes based on battery level
  const getColor = (percentage: number): string => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (percentage: number): string => {
    if (percentage >= 70) return 'accent-green-600';
    if (percentage >= 40) return 'accent-yellow-600';
    return 'accent-red-600';
  };

  return (
    <div className="w-full px-4 py-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="battery-slider" className="text-sm font-medium text-gray-700">
          Current Battery
        </label>
        <span className={`text-2xl font-bold ${getColor(value)}`}>
          {value}%
        </span>
      </div>

      {/* Slider */}
      <input
        id="battery-slider"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${getBgColor(value)} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Battery percentage"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      />

      {/* Battery indicator markers */}
      <div className="flex justify-between text-xs text-gray-500 mt-3 px-1">
        <span>Empty</span>
        <span>Low</span>
        <span>Half</span>
        <span>High</span>
        <span>Full</span>
      </div>

      {/* Visual battery bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            value >= 70
              ? 'bg-green-600'
              : value >= 40
                ? 'bg-yellow-600'
                : 'bg-red-600'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500 mt-3">
        Adjust to match your vehicle's current battery level
      </p>
    </div>
  );
}
