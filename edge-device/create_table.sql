CREATE TABLE devices (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('ONLINE', 'OFFLINE', 'DEGRADED')),
    last_seen TIMESTAMP
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    species VARCHAR(100),
    location VARCHAR(255),
    threat_level VARCHAR(20) CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH')),
    device_id VARCHAR(100) REFERENCES devices(id),
    confidence NUMERIC(4,2)
);

CREATE INDEX idx_incidents_timestamp ON incidents(timestamp);
CREATE INDEX idx_incidents_device_id ON incidents(device_id);