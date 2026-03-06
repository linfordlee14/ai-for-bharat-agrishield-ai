// Core domain types
export type Species = 'Elephant' | 'Boar' | 'Deer' | 'Leopard' | 'Human' | 'Unknown'
export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type DeviceStatus = 'Online' | 'Offline'
export type UserRole = 'ranger' | 'admin'
export type PowerMode = 'NORMAL' | 'SAVING' | 'CRITICAL'
export type NetworkType = 'WiFi' | 'GSM' | 'LoRa'
export type MovementType = 'migrating' | 'foraging'

// Incident type
export interface Incident {
  id: string
  device_id: string
  timestamp: number
  species: Species
  confidence: number
  threat_level: ThreatLevel
  latitude: number
  longitude: number
  image_url?: string
  audio_url?: string
  server_timestamp?: number
  message_id?: string
}

// Device type
export interface Device {
  device_id: string
  location_name: string
  latitude: number
  longitude: number
  status: DeviceStatus
  last_seen: number
  firmware_version: string
  model_version: string
  configuration: DeviceConfiguration
  phone_numbers: string[]
  created_at: number
  updated_at: number
}

// Device configuration
export interface DeviceConfiguration {
  confidence_threshold: number
  frame_rate: number
  monitoring_hours: {
    start: string
    end: string
  }
  deterrence_enabled: boolean
  sync_interval_seconds: number
}

// Telemetry type
export interface Telemetry {
  device_id: string
  timestamp: number
  cpu_temperature: number
  disk_usage_percent: number
  battery_level_percent: number
  uptime_seconds: number
  network_type: NetworkType
  connection_quality: number
}

// Movement event type
export interface MovementEvent {
  movement_id: string
  species: Species
  timestamp: number
  incident_ids: string[]
  start_location: {
    lat: number
    lng: number
    device_id: string
  }
  end_location: {
    lat: number
    lng: number
    device_id: string
  }
  distance_km: number
  speed_kmh: number
  movement_type: MovementType
  duration_seconds: number
}

// User type
export interface User {
  user_id: string
  email: string
  role: UserRole
  name: string
}

// Auth context type
export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

// API response types
export interface IncidentsResponse {
  incidents: Incident[]
  total: number
  next_token?: string | null
}

export interface DevicesResponse {
  devices: Device[]
  total: number
}

export interface TelemetryResponse {
  telemetry: Telemetry[]
  total: number
}

export interface MovementEventsResponse {
  movements: MovementEvent[]
  total: number
}

// API request types
export interface IncidentQueryParams {
  device_id?: string
  start_date?: number
  end_date?: number
  species?: Species
  threat_level?: ThreatLevel
  limit?: number
  next_token?: string
}

export interface UpdateDeviceConfigRequest {
  device_id: string
  configuration: Partial<DeviceConfiguration>
}

// Filter types for UI
export interface IncidentFilters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  species: Species[]
  threatLevel: ThreatLevel[]
  deviceId: string | null
}

// Chart data types
export interface ChartDataPoint {
  label: string
  value: number
}

export interface TimeSeriesDataPoint {
  timestamp: number
  count: number
}

// Diagnostic types
export interface DiagnosticResult {
  test_name: string
  status: 'pass' | 'fail'
  message: string
  timestamp: number
}

export interface DiagnosticReport {
  device_id: string
  timestamp: number
  results: DiagnosticResult[]
}
