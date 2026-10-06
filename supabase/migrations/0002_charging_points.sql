-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create charging_points table
CREATE TABLE IF NOT EXISTS charging_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ndw_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  address VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  charger_power_kw DECIMAL(5, 2),
  connector_types VARCHAR[] DEFAULT '{}',
  num_connectors INT,
  price_per_kwh DECIMAL(5, 2),
  availability_total INT,
  availability_available INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for efficient geographic queries
CREATE INDEX idx_charging_points_location ON charging_points USING GIST(location);

-- Create index on ndw_id for fast lookups
CREATE INDEX idx_charging_points_ndw_id ON charging_points(ndw_id);

-- Create index on updated_at for sync detection
CREATE INDEX idx_charging_points_updated_at ON charging_points(updated_at DESC);

-- Add comment explaining the table
COMMENT ON TABLE charging_points IS 'Charging points in the Netherlands sourced from NDW Open Data. Location uses PostGIS GEOGRAPHY type for efficient radius queries.';
COMMENT ON COLUMN charging_points.location IS 'PostGIS geography point (latitude, longitude) for efficient distance calculations';
COMMENT ON COLUMN charging_points.ndw_id IS 'Unique identifier from NDW Open Data feed';
COMMENT ON COLUMN charging_points.price_per_kwh IS 'Price in EUR per kilowatt-hour. NULL if unknown.';
COMMENT ON COLUMN charging_points.availability_available IS 'Number of available connectors as of last_updated';
