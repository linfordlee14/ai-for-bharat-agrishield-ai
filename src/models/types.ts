export type Species = 'elephant' | 'boar' | 'deer' | 'leopard' | 'human' | 'unknown';

export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'NEW' | 'REVIEWED' | 'RESOLVED';

export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface DeterrenceAction {
  sound_played: boolean;
  lights_activated: boolean;
  pattern: string;
}

export interface Incident {
  incident_id: string;
  device_id: string;
  timestamp: number;
  species: Species;
  confidence: number;
  threat_level: ThreatLevel;
  location: Location;
  image_url?: string;
  audio_url?: string;
  deterrence_action: DeterrenceAction;
  status: IncidentStatus;
  notes: string;
}

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';

export interface DeviceConfig {
  confidence_threshold: number;
  deterrence_enabled: boolean;
}

export interface Device {
  device_id: string;
  name: string;
  location: Location;
  status: DeviceStatus;
  last_heartbeat: number;
  battery_level?: number;
  signal_strength?: number;
  firmware_version?: string;
  total_incidents_24h: number;
  config: DeviceConfig;
}

export interface Alert {
  alert_id: string;
  incident_id: string;
  type: string;
  severity: ThreatLevel;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'ranger' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
