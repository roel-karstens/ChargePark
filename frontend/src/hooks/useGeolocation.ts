import { useState, useEffect } from 'react';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * useGeolocation - Hook to get user's current location
 * Requests permission and returns coordinates or error
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation not supported in this browser',
        isLoading: false,
      });
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        error: null,
        isLoading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unable to get your location';
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied. Please enable location access in browser settings.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information is unavailable.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out.';
      }

      setState({
        coordinates: null,
        error: errorMessage,
        isLoading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, []);

  return state;
}
