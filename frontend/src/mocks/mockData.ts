/**
 * Mock data for AgriShield AI demo
 * This provides realistic sample data for testing the frontend without AWS backend
 */

import type { Incident, Device, Telemetry, MovementEvent, User } from '../types'

// Generate timestamp for the last N days
const daysAgo = (days: number) => Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60)
const hoursAgo = (hours: number) => Math.floor(Date.now() / 1000) - (hours * 60 * 60)

// Mock devices in India (Karnataka and Maharashtra regions)
export const mockDevices: Device[] = [
  {
    device_id: 'agrishield-device-001',
    location_name: 'Farm Block A - North Sector',
    latitude: 15.3647,
    longitude: 75.1240,
    status: 'Online',
    last_seen: hoursAgo(0.5),
    firmware_version: '1.2.3',
    model_version: '2.1.0',
    configuration: {
      confidence_threshold: 0.7,
      frame_rate: 15,
      deterrence_enabled: true,
      monitoring_hours: {
        start: '06:00',
        end: '20:00',
      },
      sync_interval_seconds: 900,
    },
    phone_numbers: ['+919876543210'],
    created_at: daysAgo(30),
    updated_at: hoursAgo(1),
  },
  {
    device_id: 'agrishield-device-002',
    location_name: 'Farm Block B - East Sector',
    latitude: 15.4589,
    longitude: 75.2456,
    status: 'Online',
    last_seen: hoursAgo(1),
    firmware_version: '1.2.3',
    model_version: '2.1.0',
    configuration: {
      confidence_threshold: 0.7,
      frame_rate: 15,
      deterrence_enabled: true,
      monitoring_hours: {
        start: '06:00',
        end: '20:00',
      },
      sync_interval_seconds: 900,
    },
    phone_numbers: ['+919876543211'],
    created_at: daysAgo(30),
    updated_at: hoursAgo(2),
  },
  {
    device_id: 'agrishield-device-003',
    location_name: 'Farm Block C - South Sector',
    latitude: 15.2834,
    longitude: 75.0892,
    status: 'Online',
    last_seen: hoursAgo(0.25),
    firmware_version: '1.2.3',
    model_version: '2.1.0',
    configuration: {
      confidence_threshold: 0.7,
      frame_rate: 15,
      deterrence_enabled: true,
      monitoring_hours: {
        start: '06:00',
        end: '20:00',
      },
      sync_interval_seconds: 900,
    },
    phone_numbers: ['+919876543212'],
    created_at: daysAgo(30),
    updated_at: hoursAgo(0.5),
  },
  {
    device_id: 'agrishield-device-004',
    location_name: 'Farm Block D - West Sector',
    latitude: 15.3123,
    longitude: 74.9876,
    status: 'Offline',
    last_seen: hoursAgo(48),
    firmware_version: '1.2.2',
    model_version: '2.0.5',
    configuration: {
      confidence_threshold: 0.7,
      frame_rate: 15,
      deterrence_enabled: true,
      monitoring_hours: {
        start: '06:00',
        end: '20:00',
      },
      sync_interval_seconds: 900,
    },
    phone_numbers: ['+919876543213'],
    created_at: daysAgo(45),
    updated_at: hoursAgo(48),
  },
  {
    device_id: 'agrishield-device-005',
    location_name: 'Farm Block E - Central Sector',
    latitude: 15.3892,
    longitude: 75.1567,
    status: 'Online',
    last_seen: hoursAgo(2),
    firmware_version: '1.2.3',
    model_version: '2.1.0',
    configuration: {
      confidence_threshold: 0.7,
      frame_rate: 15,
      deterrence_enabled: false,
      monitoring_hours: {
        start: '06:00',
        end: '20:00',
      },
      sync_interval_seconds: 900,
    },
    phone_numbers: ['+919876543214'],
    created_at: daysAgo(20),
    updated_at: hoursAgo(3),
  },
]

// Mock incidents with realistic distribution
export const mockIncidents: Incident[] = [
  // Recent HIGH threat incidents (Elephants)
  {
    id: 'incident-001',
    device_id: 'agrishield-device-001',
    timestamp: hoursAgo(2),
    species: 'Elephant',
    confidence: 0.95,
    threat_level: 'HIGH',
    latitude: 15.3647,
    longitude: 75.1240,
    image_url: 'https://example.com/incidents/001/image.jpg',
    audio_url: 'https://example.com/incidents/001/audio.wav',
  },
  {
    id: 'incident-002',
    device_id: 'agrishield-device-003',
    timestamp: hoursAgo(5),
    species: 'Elephant',
    confidence: 0.88,
    threat_level: 'HIGH',
    latitude: 15.2834,
    longitude: 75.0892,
    image_url: 'https://example.com/incidents/002/image.jpg',
    audio_url: 'https://example.com/incidents/002/audio.wav',
  },
  {
    id: 'incident-003',
    device_id: 'agrishield-device-002',
    timestamp: hoursAgo(8),
    species: 'Leopard',
    confidence: 0.82,
    threat_level: 'HIGH',
    latitude: 15.4589,
    longitude: 75.2456,
    image_url: 'https://example.com/incidents/003/image.jpg',
    audio_url: 'https://example.com/incidents/003/audio.wav',
  },
  
  // MEDIUM threat incidents (Boars)
  {
    id: 'incident-004',
    device_id: 'agrishield-device-001',
    timestamp: hoursAgo(12),
    species: 'Boar',
    confidence: 0.78,
    threat_level: 'MEDIUM',
    latitude: 15.3712,
    longitude: 75.1189,
    image_url: 'https://example.com/incidents/004/image.jpg',
    audio_url: 'https://example.com/incidents/004/audio.wav',
  },
  {
    id: 'incident-005',
    device_id: 'agrishield-device-005',
    timestamp: hoursAgo(15),
    species: 'Boar',
    confidence: 0.85,
    threat_level: 'MEDIUM',
    latitude: 15.3892,
    longitude: 75.1567,
    image_url: 'https://example.com/incidents/005/image.jpg',
    audio_url: 'https://example.com/incidents/005/audio.wav',
  },
  {
    id: 'incident-006',
    device_id: 'agrishield-device-002',
    timestamp: hoursAgo(18),
    species: 'Boar',
    confidence: 0.72,
    threat_level: 'MEDIUM',
    latitude: 15.4523,
    longitude: 75.2389,
    image_url: 'https://example.com/incidents/006/image.jpg',
    audio_url: 'https://example.com/incidents/006/audio.wav',
  },
  
  // LOW threat incidents (Deer, Human)
  {
    id: 'incident-007',
    device_id: 'agrishield-device-003',
    timestamp: hoursAgo(24),
    species: 'Deer',
    confidence: 0.91,
    threat_level: 'LOW',
    latitude: 15.2901,
    longitude: 75.0845,
    image_url: 'https://example.com/incidents/007/image.jpg',
    audio_url: 'https://example.com/incidents/007/audio.wav',
  },
  {
    id: 'incident-008',
    device_id: 'agrishield-device-001',
    timestamp: daysAgo(1),
    species: 'Deer',
    confidence: 0.87,
    threat_level: 'LOW',
    latitude: 15.3589,
    longitude: 75.1298,
    image_url: 'https://example.com/incidents/008/image.jpg',
    audio_url: 'https://example.com/incidents/008/audio.wav',
  },
  {
    id: 'incident-009',
    device_id: 'agrishield-device-005',
    timestamp: daysAgo(1),
    species: 'Human',
    confidence: 0.93,
    threat_level: 'LOW',
    latitude: 15.3945,
    longitude: 75.1512,
    image_url: 'https://example.com/incidents/009/image.jpg',
    audio_url: 'https://example.com/incidents/009/audio.wav',
  },
  
  // Older incidents for history
  {
    id: 'incident-010',
    device_id: 'agrishield-device-002',
    timestamp: daysAgo(2),
    species: 'Elephant',
    confidence: 0.89,
    threat_level: 'HIGH',
    latitude: 15.4634,
    longitude: 75.2512,
    image_url: 'https://example.com/incidents/010/image.jpg',
    audio_url: 'https://example.com/incidents/010/audio.wav',
  },
  {
    id: 'incident-011',
    device_id: 'agrishield-device-003',
    timestamp: daysAgo(2),
    species: 'Boar',
    confidence: 0.76,
    threat_level: 'MEDIUM',
    latitude: 15.2767,
    longitude: 75.0934,
    image_url: 'https://example.com/incidents/011/image.jpg',
    audio_url: 'https://example.com/incidents/011/audio.wav',
  },
  {
    id: 'incident-012',
    device_id: 'agrishield-device-001',
    timestamp: daysAgo(3),
    species: 'Leopard',
    confidence: 0.84,
    threat_level: 'HIGH',
    latitude: 15.3756,
    longitude: 75.1167,
    image_url: 'https://example.com/incidents/012/image.jpg',
    audio_url: 'https://example.com/incidents/012/audio.wav',
  },
  {
    id: 'incident-013',
    device_id: 'agrishield-device-005',
    timestamp: daysAgo(3),
    species: 'Deer',
    confidence: 0.88,
    threat_level: 'LOW',
    latitude: 15.3823,
    longitude: 75.1623,
    image_url: 'https://example.com/incidents/013/image.jpg',
    audio_url: 'https://example.com/incidents/013/audio.wav',
  },
  {
    id: 'incident-014',
    device_id: 'agrishield-device-002',
    timestamp: daysAgo(4),
    species: 'Boar',
    confidence: 0.81,
    threat_level: 'MEDIUM',
    latitude: 15.4512,
    longitude: 75.2401,
    image_url: 'https://example.com/incidents/014/image.jpg',
    audio_url: 'https://example.com/incidents/014/audio.wav',
  },
  {
    id: 'incident-015',
    device_id: 'agrishield-device-003',
    timestamp: daysAgo(5),
    species: 'Unknown',
    confidence: 0.65,
    threat_level: 'LOW',
    latitude: 15.2698,
    longitude: 75.0789,
    image_url: 'https://example.com/incidents/015/image.jpg',
    audio_url: 'https://example.com/incidents/015/audio.wav',
  },
  {
    id: 'incident-016',
    device_id: 'agrishield-device-001',
    timestamp: daysAgo(6),
    species: 'Elephant',
    confidence: 0.92,
    threat_level: 'HIGH',
    latitude: 15.3578,
    longitude: 75.1312,
    image_url: 'https://example.com/incidents/016/image.jpg',
    audio_url: 'https://example.com/incidents/016/audio.wav',
  },
  {
    id: 'incident-017',
    device_id: 'agrishield-device-005',
    timestamp: daysAgo(7),
    species: 'Deer',
    confidence: 0.86,
    threat_level: 'LOW',
    latitude: 15.3967,
    longitude: 75.1489,
    image_url: 'https://example.com/incidents/017/image.jpg',
    audio_url: 'https://example.com/incidents/017/audio.wav',
  },
]

// Mock telemetry data
export const mockTelemetry: Telemetry[] = mockDevices.flatMap((device) => {
  const telemetryPoints: Telemetry[] = []
  
  // Generate telemetry for last 24 hours (every 5 minutes)
  for (let i = 0; i < 288; i++) {
    const timestamp = hoursAgo(24) + (i * 5 * 60)
    
    telemetryPoints.push({
      device_id: device.device_id,
      timestamp,
      cpu_temperature: 45 + Math.random() * 30, // 45-75°C
      disk_usage_percent: 30 + Math.random() * 40, // 30-70%
      battery_level_percent: device.status === 'Online' ? 60 + Math.random() * 35 : 15 + Math.random() * 10,
      uptime_seconds: i * 5 * 60,
      network_type: device.status === 'Online' ? 'WiFi' : 'GSM',
      connection_quality: device.status === 'Online' ? 0.7 + Math.random() * 0.3 : 0,
    })
  }
  
  return telemetryPoints
})

// Mock movement events
export const mockMovementEvents: MovementEvent[] = [
  {
    movement_id: 'movement-001',
    species: 'Elephant',
    timestamp: hoursAgo(6),
    incident_ids: ['incident-001', 'incident-002'],
    start_location: {
      lat: 15.3647,
      lng: 75.1240,
      device_id: 'agrishield-device-001',
    },
    end_location: {
      lat: 15.2834,
      lng: 75.0892,
      device_id: 'agrishield-device-003',
    },
    distance_km: 4.2,
    speed_kmh: 1.4,
    movement_type: 'foraging',
    duration_seconds: 10800, // 3 hours
  },
  {
    movement_id: 'movement-002',
    species: 'Boar',
    timestamp: hoursAgo(18),
    incident_ids: ['incident-004', 'incident-005'],
    start_location: {
      lat: 15.3712,
      lng: 75.1189,
      device_id: 'agrishield-device-001',
    },
    end_location: {
      lat: 15.3892,
      lng: 75.1567,
      device_id: 'agrishield-device-005',
    },
    distance_km: 1.8,
    speed_kmh: 0.6,
    movement_type: 'foraging',
    duration_seconds: 10800, // 3 hours
  },
]

// Mock users for authentication
export const mockUsers: Record<string, { password: string; user: User }> = {
  'ranger@agrishield.ai': {
    password: 'ranger123',
    user: {
      user_id: 'user-001',
      email: 'ranger@agrishield.ai',
      role: 'ranger',
      name: 'John Ranger',
    },
  },
  'admin@agrishield.ai': {
    password: 'admin123',
    user: {
      user_id: 'user-002',
      email: 'admin@agrishield.ai',
      role: 'admin',
      name: 'Sarah Admin',
    },
  },
}
