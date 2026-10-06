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
import './MapView.css';

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
  const glowMarkersRef = useRef<L.Marker[]>([]);
  const isInitializedRef = useRef(false);

  // Initialize map ONLY ONCE on mount
  useEffect(() => {
    if (!mapRef.current || isInitializedRef.current) return;

    isInitializedRef.current = true;
    leafletMapRef.current = L.map(mapRef.current).setView(
      [userLocation.latitude, userLocation.longitude],
      15,
    );

    // Add OpenStreetMap tiles (standard, free, no API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(leafletMapRef.current);

    // Add user location marker (grey circle) - once at init
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
    userMarker.addTo(leafletMapRef.current);
    userMarker.bindPopup('<strong>Your Location</strong>', { offset: L.point(0, -10) });
  }, []); // Empty dependency - only on mount

  // Update markers and zoom ONLY when chargers change (not userLocation)
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // Only fit bounds on first load when we have chargers
    if (chargers.length > 0 && isInitializedRef.current) {
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
      ]);
      
      chargers.forEach((result) => {
        const lat = parseFloat(result.charger.latitude);
        const lon = parseFloat(result.charger.longitude);
        bounds.extend([lat, lon]);
      });
      
      // Fit map to bounds with padding (maxZoom 16 for closeup detail)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }

    // Clear existing charger markers and glow effects
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    glowMarkersRef.current.forEach((marker) => marker.remove());
    glowMarkersRef.current = [];

    // Add charger markers
    chargers.forEach((result) => {
      const lat = parseFloat(result.charger.latitude);
      const lon = parseFloat(result.charger.longitude);
      const pricePerHour = result.cost_estimate.cost_per_hour_eur
        ? parseFloat(result.cost_estimate.cost_per_hour_eur)
        : 0;

      // Dark blue color palette with subtle glow effect
      let markerColor = '#1e3a8a'; // dark navy blue
      if (pricePerHour > 0.5) markerColor = '#1e40af'; // medium dark blue
      if (pricePerHour > 1.0) markerColor = '#1d4ed8'; // slightly lighter blue

      // Create glow effect with larger semi-transparent circle underneath
      const glowMarker = L.circleMarker([lat, lon], {
        color: 'none',
        fillColor: markerColor,
        fillOpacity: 0.15,
        radius: 12,
        weight: 0,
        bubblingMouseEvents: false,  // Don't intercept clicks
      });
      glowMarker.addTo(map);
      glowMarkersRef.current.push(glowMarker);

      // Main marker on top
      const chargerMarker = L.circleMarker([lat, lon], {
        color: '#ffffff',  // white border for contrast
        fillColor: markerColor,
        fillOpacity: 0.95,
        radius: 7,
        weight: 2,
        bubblingMouseEvents: true,  // Allow clicks to bubble
      });

      chargerMarker.addTo(map);

      // Add price tooltip that always shows above marker
      const tooltip = L.tooltip({
        permanent: true,
        direction: 'top',
        offset: [0, -20],
        className: 'charger-price-tooltip',
      });
      tooltip.setContent(`€${pricePerHour.toFixed(2)}/hr`);
      chargerMarker.bindTooltip(tooltip);

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
          color: '#fbbf24',  // golden/yellow border for selection
          weight: 3,
          fillOpacity: 1.0,
          fillColor: '#0c4a6e',  // darker blue for selection
        });
      }

      markersRef.current.set(result.charger.id, chargerMarker);
    });

    return () => {
      // Cleanup on unmount
    };
  }, [chargers, selectedCharger, onChargerSelect]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-gray-200 rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
}
