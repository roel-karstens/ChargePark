// Project (existing)
export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Charging Domain Types
export interface ChargerDetail {
  id: string;
  ndw_id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  charger_power_kw: string | null;
  connector_types: string[];
  num_connectors: number;
  price_per_kwh: string | null;
  availability_total: number;
  availability_available: number;
  last_updated: string;
}

export interface ChargingCostEstimate {
  total_cost_eur: string;
  battery_kwh: string;
  charging_time_minutes: number;
  cost_confidence: "exact" | "estimated" | "unknown";
}

export interface ChargingResultItem {
  charger: ChargerDetail;
  cost_estimate: ChargingCostEstimate;
  distance_meters: number;
  distance_minutes: number | null;
  total_time_minutes: number;
}

export interface ChargingSearchResponse {
  destination: string;
  latitude: string;
  longitude: string;
  battery_percentage: number;
  results: ChargingResultItem[];
  total_results: number;
  search_timestamp: string;
}

export interface GeocodeResult {
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  type: string;
}

export interface GeocodeSearchResponse {
  query: string;
  results: GeocodeResult[];
  total_results: number;
}

// Error Response
export interface ApiError {
  error: string;
  message: string;
  status_code: number;
}

// Request types for API calls
export interface ChargingSearchRequest {
  destination: string;
  battery_percentage: number;
  radius_meters?: number;
  sort_by?: "cost" | "time" | "distance";
}
