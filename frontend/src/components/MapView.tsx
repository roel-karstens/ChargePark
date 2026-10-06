/**
 * MapView component - displays charging points on a Leaflet map.
 *
 * Features:
 * - Interactive Leaflet map
 * - Charger markers
 * - Destination marker
 * - Click marker to select charger
 * - Mobile-optimized
 *
 * Note: Requires leaflet to be installed (npm install leaflet)
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ChargingSearchResponse } from '../types';

interface MapViewProps {
  response: ChargingSearchResponse | null;
  selectedChargerId?: string;
  onSelectCharger?: (chargerId: string) => void;
}

export function MapView({
  response,
  selectedChargerId,
  onSelectCharger,
}: MapViewProps): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || !response) return;

    // Initialize map (only once)
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView(
        [parseFloat(response.latitude), parseFloat(response.longitude)],
        14,
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add destination marker
    const destinationMarker = L.circleMarker(
      [parseFloat(response.latitude), parseFloat(response.longitude)],
      {
        radius: 8,
        fillColor: '#2563eb',
        color: '#1e40af',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      },
    )
      .bindPopup(`<strong>${response.destination}</strong>`)
      .addTo(map);

    // Add charger markers
    response.results.forEach((result, index) => {
      const { charger } = result;
      const isSelected = charger.id === selectedChargerId;

      const marker = L.circleMarker(
        [parseFloat(charger.latitude), parseFloat(charger.longitude)],
        {
          radius: isSelected ? 12 : 8,
          fillColor: isSelected ? '#10b981' : '#84cc16',
          color: isSelected ? '#059669' : '#65a30d',
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: isSelected ? 0.9 : 0.7,
        },
      )
        .bindPopup(
          `<div class="font-sm"><strong>${charger.name}</strong><br/>
           €${result.cost_estimate.total_cost_eur} • ${result.total_time_minutes}min</div>`,
        )
        .on('click', () => {
          onSelectCharger?.(charger.id);
        })
        .addTo(map);

      // Add label
      const label = L.tooltip(
        { permanent: true, direction: 'top', offset: [0, -15] },
        marker,
      )
        .setContent(`${index + 1}`)
        .addTo(map);

      markersRef.current.set(charger.id, marker);
    });

    // Fit map to bounds (destination + chargers)
    const group = new L.FeatureGroup([destinationMarker, ...markersRef.current.values()]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    // Update marker when selected charger changes
    return () => {
      markersRef.current.forEach((marker, id) => {
        if (id === selectedChargerId) {
          marker.setRadius(12);
          marker.setStyle({ weight: 3, fillOpacity: 0.9 });
        } else {
          marker.setRadius(8);
          marker.setStyle({ weight: 2, fillOpacity: 0.7 });
        }
      });
    };
  }, [response, selectedChargerId, onSelectCharger]);

  if (!response) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Search for charging options to see the map</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-64 sm:h-96 rounded-lg border border-gray-300 shadow-md"
      role="region"
      aria-label="Map of charging points"
    />
  );
}
