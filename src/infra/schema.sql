-- ============================================================================
-- PRAVAHA: Power Outage Prediction & Grid Equipment Failure Advisor
-- Supabase / PostgreSQL Schema Definition
-- ============================================================================

-- 1. Industries / Utility Companies
CREATE TABLE IF NOT EXISTS industries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    customer_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- 2. Substations
CREATE TABLE IF NOT EXISTS substations (
    id SERIAL PRIMARY KEY,
    industry_id INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL
);

-- 3. Assets & Transformers
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    substation_id INTEGER NOT NULL REFERENCES substations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Asset',
    asset_type VARCHAR(100) NOT NULL,
    capacity VARCHAR(100),
    installation_year INTEGER,
    affected_customers INTEGER DEFAULT 0
);

-- 4. Sensor Telemetry Readings
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    temperature DOUBLE PRECISION,
    vibration DOUBLE PRECISION,
    partial_discharge DOUBLE PRECISION,
    oil_quality DOUBLE PRECISION,
    load_percentage DOUBLE PRECISION,
    recorded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- 5. Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    region VARCHAR(255) NOT NULL,
    temperature DOUBLE PRECISION,
    rainfall DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    lightning_risk DOUBLE PRECISION,
    recorded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- 6. Historical Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium',
    outage_duration DOUBLE PRECISION DEFAULT 0.0,
    affected_customers INTEGER DEFAULT 0,
    incident_date TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- 7. Operational Threats & Advisory Recommendations
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    threat_type VARCHAR(100) NOT NULL,
    risk_level VARCHAR(50) DEFAULT 'Low',
    risk_score DOUBLE PRECISION DEFAULT 0.0,
    explanation TEXT,
    recommended_action TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_substations_industry_id ON substations(industry_id);
CREATE INDEX IF NOT EXISTS idx_assets_substation_id ON assets(substation_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_asset_id ON sensor_readings(asset_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_region ON weather_data(region);
CREATE INDEX IF NOT EXISTS idx_incidents_asset_id ON incidents(asset_id);
CREATE INDEX IF NOT EXISTS idx_threats_asset_id ON threats(asset_id);
