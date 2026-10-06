/**
 * MapView component - displays charging points on a Leaflet map.
 *
 * Features:
 * - Interactive Leaflet map
 * - User location marker (blue)
 * - Charger markers (red/green based on price)
 * - Click marker to select charger
 * - Mobile-optimized
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ChargingResultItem } from '../types';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  userLocation: UserLocation;
  chargers: ChargingResultItem[];
  selectedCharger?: ChargingResultItem | null;
  onChargerSelect?: (charger: ChargingResultItem) => void;
}

export function MapView({
  userLocation,
  chargers,
  selectedCharger,
  onChargerSelect,
}: MapViewProps): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map (only once)
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView(
        [userLocation.latitude, userLocation.longitude],
        14,
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;

    // Update map view if user location changes
    map.setView([userLocation.latitude, userLocation.longitude], 14);

    // Clear existing charger markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add user location marker (blue circle)
    const userMarker = L.circleMarker(
      [userLocation.latitude, userLocation.longitude],
      {
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.8,
        radius: 10,
        weight: 3,
      }
    );
    userMarker.addTo(map);
    userMarker.bindPopup('<strong>Your Location</strong>', { offset: L.point(0, -10) });

    // Add charger markers
    chargers.forEach((result) => {
      const lat = parseFloat(result.charger.latitude);
      const lon = parseFloat(result.charger.longitude);
      const pricePerHour = result.cost_estimate.cost_per_hour_eur
        ? parseFloat(result.cost_estimate.cost_per_hour_eur)
        : 0;

      // Color based on price per hour: green (cheap), yellow (moderate), red (expensive)
      let markerColor = '#10b981'; // green
      if (pricePerHour > 0.5) markerColor = '#f59e0b'; // yellow
      if (pricePerHour > 1.0) markerColor = '#ef4444'; // red

      const chargerMarker = L.circleMarker([lat, lon], {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.8,
        radius: 8,
        weight: 2,
      });

      chargerMarker.addTo(map);

      // Create popup content
      const popupContent = `
        <div class="p-2 text-sm">
          <strong>${result.charger.name}</strong><br/>
          €${pricePerHour.toFixed(2)}/hr • ${result.charger.charger_power_kw}kW<br/>
          ${result.distance_meters}m away
        </div>
      `;
      chargerMarker.bindPopup(popupContent);

      // Click to select
      chargerMarker.on('click', () => {
        onChargerSelect?.(result);
      });

      // Highlight if selected
      if (selectedCharger?.charger.id === result.charger.id) {
        chargerMarker.setStyle({
          color: '#000',
          weight: 4,
          fillOpacity: 1,
        });
      }

      markersRef.current.set(result.charger.id, chargerMarker);
    });

    return () => {
      // Cleanup on unmount
    };
  }, [userLocation, chargers, selectedCharger, onChargerSelect]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-gray-200 rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
}
