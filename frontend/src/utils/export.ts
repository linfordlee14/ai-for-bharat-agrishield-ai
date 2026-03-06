import Papa from 'papaparse'
import type { Incident } from '@/types'

/**
 * Export incidents to CSV and trigger download
 */
export const exportIncidentsToCSV = (incidents: Incident[], filename = 'incidents.csv'): void => {
  const data = incidents.map(incident => ({
    timestamp: new Date(incident.timestamp * 1000).toISOString(),
    device_id: incident.device_id,
    species: incident.species,
    confidence: incident.confidence,
    threat_level: incident.threat_level,
    latitude: incident.latitude,
    longitude: incident.longitude,
    image_url: incident.image_url || '',
    audio_url: incident.audio_url || '',
  }))

  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: any[], filename: string): void => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, `${filename}.json`)
}

/**
 * Trigger download of a blob
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
