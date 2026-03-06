import type { Species, ThreatLevel } from '@/types'

/**
 * Format Unix timestamp to human-readable date/time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format duration in seconds to human-readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

/**
 * Format confidence score as percentage
 */
export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(1)}%`
}

/**
 * Get color class for threat level
 */
export const getThreatLevelColor = (level: ThreatLevel): string => {
  switch (level) {
    case 'HIGH':
      return 'text-danger-600 bg-danger-50'
    case 'MEDIUM':
      return 'text-warning-600 bg-warning-50'
    case 'LOW':
      return 'text-success-600 bg-success-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Get marker color for threat level (for map)
 */
export const getThreatLevelMarkerColor = (level: ThreatLevel): string => {
  switch (level) {
    case 'HIGH':
      return '#dc2626' // red
    case 'MEDIUM':
      return '#f59e0b' // orange
    case 'LOW':
      return '#fbbf24' // yellow
    default:
      return '#6b7280' // gray
  }
}

/**
 * Get display name for species
 */
export const getSpeciesDisplayName = (species: Species): string => {
  return species
}

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format temperature
 */
export const formatTemperature = (celsius: number): string => {
  return `${celsius.toFixed(1)}°C`
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

/**
 * Format uptime in human-readable format
 */
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  
  return parts.join(' ') || '0m'
}
