/**
 * Custom hook for battery state management.
 *
 * Handles:
 * - Current battery percentage
 * - Persistence to localStorage
 * - Updates with bounds checking (0-100)
 */

import { useState, useEffect, useCallback } from 'react';

const BATTERY_STORAGE_KEY = 'chargepark_battery_percentage';
const DEFAULT_BATTERY = 50;

export function useBattery() {
  const [battery, setBattery] = useState<number>(DEFAULT_BATTERY);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BATTERY_STORAGE_KEY);
      if (stored) {
        const value = parseInt(stored, 10);
        if (value >= 0 && value <= 100) {
          setBattery(value);
        }
      }
    } catch (err) {
      // Silently fail (localStorage may be unavailable)
      console.warn('Failed to load battery from localStorage:', err);
    }
  }, []);

  // Update battery and persist
  const setBatteryPercentage = useCallback((value: number) => {
    const bounded = Math.max(0, Math.min(100, Math.round(value)));
    setBattery(bounded);

    try {
      localStorage.setItem(BATTERY_STORAGE_KEY, String(bounded));
    } catch (err) {
      console.warn('Failed to save battery to localStorage:', err);
    }
  }, []);

  // Convenience functions
  const increment = useCallback((amount: number = 1) => {
    setBatteryPercentage(battery + amount);
  }, [battery, setBatteryPercentage]);

  const decrement = useCallback((amount: number = 1) => {
    setBatteryPercentage(battery - amount);
  }, [battery, setBatteryPercentage]);

  const reset = useCallback(() => {
    setBatteryPercentage(DEFAULT_BATTERY);
  }, [setBatteryPercentage]);

  return {
    battery,
    setBattery: setBatteryPercentage,
    increment,
    decrement,
    reset,
  };
}
