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
        15,
      );

      // Add CartoDB Positron (grey, clean aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        maxZoom: 19,
      }).addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;

    // Calculate optimal zoom level based on chargers to show walking distance
    if (chargers.length > 0) {
      // Create bounds group with user location and chargers
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
      ]);
      
      // Add chargers to bounds
      chargers.forEach((result) => {
        const lat = parseFloat(result.charger.latitude);
        const lon = parseFloat(result.charger.longitude);
        bounds.extend([lat, lon]);
      });
      
      // Fit map to bounds with padding (maxZoom 16 for closeup detail)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      // No chargers: center on user with good zoom for walking distance
      map.setView([userLocation.latitude, userLocation.longitude], 15);
    }

    // Clear existing charger markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add user location marker (grey circle)
    const userMarker = L.circleMarker(
      [userLocation.latitude, userLocation.longitude],
      {
        color: '#666666',
        fillColor: '#4b5563',
        fillOpacity: 0.6,
        radius: 9,
        weight: 2,
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

      // Color based on price per hour: subtle grey-green
      // Cheap: soft green, Moderate: soft yellow, Expensive: soft red
      let markerColor = '#78a569'; // soft green
      if (pricePerHour > 0.5) markerColor = '#d4a574'; // soft golden
      if (pricePerHour > 1.0) markerColor = '#b8696b'; // soft red-brown

      const chargerMarker = L.circleMarker([lat, lon], {
        color: '#888888',  // grey border
        fillColor: markerColor,
        fillOpacity: 0.7,
        radius: 7,
        weight: 1.5,
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
          color: '#333333',
          weight: 2.5,
          fillOpacity: 0.9,
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
