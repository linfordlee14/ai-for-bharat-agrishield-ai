/**
 * Mock API implementation for demo mode
 * Simulates backend API responses with realistic delays
 */

import type { 
  Incident, 
  Device, 
  User,
  IncidentsResponse,
  DevicesResponse,
  TelemetryResponse,
  MovementEventsResponse,
} from '../types'
import { 
  mockIncidents, 
  mockDevices, 
  mockTelemetry, 
  mockMovementEvents,
  mockUsers,
} from './mockData'

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock authentication
export const mockLogin = async (email: string, password: string): Promise<User> => {
  await delay(800)
  
  const userRecord = mockUsers[email]
  
  if (!userRecord || userRecord.password !== password) {
    throw new Error('Invalid email or password')
  }
  
  // Store mock token and user in session storage
  sessionStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now())
  sessionStorage.setItem('user', JSON.stringify(userRecord.user))
  
  return userRecord.user
}

export const mockLogout = async (): Promise<void> => {
  await delay(200)
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('user')
}

// Mock incidents API
export const mockGetIncidents = async (params?: {
  device_id?: string
  start_date?: number
  end_date?: number
  species?: string
  threat_level?: string
  limit?: number
}): Promise<IncidentsResponse> => {
  await delay(600)
  
  let filtered = [...mockIncidents]
  
  // Apply filters
  if (params?.device_id) {
    filtered = filtered.filter(i => i.device_id === params.device_id)
  }
  
  if (params?.start_date) {
    filtered = filtered.filter(i => i.timestamp >= params.start_date!)
  }
  
  if (params?.end_date) {
    filtered = filtered.filter(i => i.timestamp <= params.end_date!)
  }
  
  if (params?.species) {
    filtered = filtered.filter(i => i.species === params.species)
  }
  
  if (params?.threat_level) {
    filtered = filtered.filter(i => i.threat_level === params.threat_level)
  }
  
  // Sort by timestamp descending (newest first)
  filtered.sort((a, b) => b.timestamp - a.timestamp)
  
  // Apply limit
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit)
  }
  
  return {
    incidents: filtered,
    total: filtered.length,
    next_token: null,
  }
}

export const mockGetIncident = async (id: string): Promise<Incident> => {
  await delay(400)
  
  const incident = mockIncidents.find(i => i.id === id)
  
  if (!incident) {
    throw new Error('Incident not found')
  }
  
  return incident
}

// Mock devices API
export const mockGetDevices = async (): Promise<DevicesResponse> => {
  await delay(500)
  
  return {
    devices: mockDevices,
    total: mockDevices.length,
  }
}

export const mockGetDevice = async (deviceId: string): Promise<Device> => {
  await delay(400)
  
  const device = mockDevices.find(d => d.device_id === deviceId)
  
  if (!device) {
    throw new Error('Device not found')
  }
  
  return device
}

export const mockUpdateDeviceConfig = async (
  deviceId: string,
  config: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  await delay(800)
  
  const device = mockDevices.find(d => d.device_id === deviceId)
  
  if (!device) {
    throw new Error('Device not found')
  }
  
  // Simulate config update
  device.configuration = { ...device.configuration, ...config }
  device.updated_at = Math.floor(Date.now() / 1000)
  
  return {
    success: true,
    message: 'Configuration updated successfully',
  }
}

// Mock telemetry API
export const mockGetTelemetry = async (
  deviceId: string,
  params?: {
    start_date?: number
    end_date?: number
    limit?: number
  }
): Promise<TelemetryResponse> => {
  await delay(600)
  
  let filtered = mockTelemetry.filter(t => t.device_id === deviceId)
  
  if (params?.start_date) {
    filtered = filtered.filter(t => t.timestamp >= params.start_date!)
  }
  
  if (params?.end_date) {
    filtered = filtered.filter(t => t.timestamp <= params.end_date!)
  }
  
  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp - a.timestamp)
  
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit)
  }
  
  return {
    telemetry: filtered,
    total: filtered.length,
  }
}

// Mock movement events API
export const mockGetMovementEvents = async (params?: {
  species?: string
  start_date?: number
  end_date?: number
  limit?: number
}): Promise<MovementEventsResponse> => {
  await delay(500)
  
  let filtered = [...mockMovementEvents]
  
  if (params?.species) {
    filtered = filtered.filter(m => m.species === params.species)
  }
  
  if (params?.start_date) {
    filtered = filtered.filter(m => m.timestamp >= params.start_date!)
  }
  
  if (params?.end_date) {
    filtered = filtered.filter(m => m.timestamp <= params.end_date!)
  }
  
  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp - a.timestamp)
  
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit)
  }
  
  return {
    movements: filtered,
    total: filtered.length,
  }
}

// Mock diagnostics API
export const mockRunDiagnostics = async (
  deviceId: string
): Promise<{ success: boolean; message: string }> => {
  await delay(2000) // Diagnostics take longer
  
  const device = mockDevices.find(d => d.device_id === deviceId)
  
  if (!device) {
    throw new Error('Device not found')
  }
  
  return {
    success: true,
    message: 'Diagnostics completed successfully. All systems operational.',
  }
}

// Mock export API
export const mockExportIncidents = async (params?: {
  device_id?: string
  start_date?: number
  end_date?: number
  species?: string
  threat_level?: string
}): Promise<Blob> => {
  await delay(1000)
  
  const response = await mockGetIncidents(params)
  
  // Generate CSV
  const headers = ['ID', 'Device ID', 'Timestamp', 'Species', 'Confidence', 'Threat Level', 'Latitude', 'Longitude']
  const rows = response.incidents.map(i => [
    i.id,
    i.device_id,
    new Date(i.timestamp * 1000).toISOString(),
    i.species,
    i.confidence.toFixed(2),
    i.threat_level,
    i.latitude.toFixed(6),
    i.longitude.toFixed(6),
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  return new Blob([csv], { type: 'text/csv' })
}
