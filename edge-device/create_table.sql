-- AgriShield PostgreSQL Schema (VPS Database)
-- Run this on your VPS PostgreSQL instance

CREATE TABLE devices (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('ONLINE', 'OFFLINE', 'DEGRADED')),
    last_seen TIMESTAMP,
    config TEXT
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    species VARCHAR(100),
    location VARCHAR(255),
    threat_level VARCHAR(20) CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH')),
    device_id VARCHAR(100) REFERENCES devices(id),
    confidence NUMERIC(4,2),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    media_url TEXT,
    processed VARCHAR(10) DEFAULT 'false'
);

CREATE TABLE telemetry (
    id UUID PRIMARY KEY,
    device_id VARCHAR(100) REFERENCES devices(id),
    timestamp TIMESTAMP NOT NULL,
    cpu_temp DOUBLE PRECISION,
    battery_level DOUBLE PRECISION,
    signal_strength DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION,
    disk_usage DOUBLE PRECISION,
    uptime_seconds INTEGER
);

CREATE TABLE movement_events (
    id UUID PRIMARY KEY,
    species VARCHAR(100),
    from_device_id VARCHAR(100) REFERENCES devices(id),
    to_device_id VARCHAR(100) REFERENCES devices(id),
    from_lat DOUBLE PRECISION,
    from_lng DOUBLE PRECISION,
    to_lat DOUBLE PRECISION,
    to_lng DOUBLE PRECISION,
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    movement_type VARCHAR(50),
    distance_km DOUBLE PRECISION
);

-- Indexes
CREATE INDEX idx_incidents_timestamp ON incidents(timestamp);
CREATE INDEX idx_incidents_device_id ON incidents(device_id);
CREATE INDEX idx_incidents_species ON incidents(species);
CREATE INDEX idx_incidents_threat ON incidents(threat_level);
CREATE INDEX idx_telemetry_device_id ON telemetry(device_id);
CREATE INDEX idx_telemetry_timestamp ON telemetry(timestamp);
CREATE INDEX idx_movement_species ON movement_events(species);
CREATE INDEX idx_movement_last_seen ON movement_events(last_seen);