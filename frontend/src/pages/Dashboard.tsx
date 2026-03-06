import { useState } from 'react'
import { Header, IncidentMap, LoadingSpinner, ErrorMessage, Badge } from '../components'
import { useIncidents } from '../hooks/useIncidents'
import { formatTimestamp } from '../utils/format'
import type { Incident } from '../types'

export function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  
  // Fetch incidents using React Query
  const { data, isLoading, error } = useIncidents()

  const handleMarkerClick = (incident: Incident) => {
    setSelectedIncident(incident)
  }

  const getThreatColor = (level: string): 'success' | 'warning' | 'danger' | 'primary' | 'gray' => {
    switch (level) {
      case 'HIGH': return 'danger'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'primary'
      default: return 'gray'
    }
  }

  const stats = data ? {
    total: data.incidents.length,
    high: data.incidents.filter(i => i.threat_level === 'HIGH').length,
    medium: data.incidents.filter(i => i.threat_level === 'MEDIUM').length,
    low: data.incidents.filter(i => i.threat_level === 'LOW').length,
  } : null

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">High Threat</p>
                <p className="text-3xl font-bold text-red-600">{stats.high}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Medium Threat</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Low Threat</p>
                <p className="text-3xl font-bold text-blue-600">{stats.low}</p>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center h-full p-4">
                <ErrorMessage message={error.message} />
              </div>
            )}
            
            {data && !isLoading && !error && (
              <IncidentMap 
                incidents={data.incidents}
                onMarkerClick={handleMarkerClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedIncident.species} Detection
                  </h2>
                  <p className="text-gray-500">{selectedIncident.id}</p>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Detection Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Threat Level</p>
                      <Badge variant={getThreatColor(selectedIncident.threat_level)}>
                        {selectedIncident.threat_level}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="font-medium">{(selectedIncident.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timestamp</p>
                      <p className="font-medium">{formatTimestamp(selectedIncident.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Device ID</p>
                      <p className="font-medium">{selectedIncident.device_id}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Latitude</p>
                      <p className="font-medium">{selectedIncident.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Longitude</p>
                      <p className="font-medium">{selectedIncident.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Evidence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Image</p>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <p className="text-gray-400">Image preview not available in demo mode</p>
                    </div>
                    <a
                      href={selectedIncident.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block"
                    >
                      View Full Image →
                    </a>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Audio</p>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <p className="text-gray-400">Audio player not available in demo mode</p>
                    </div>
                    <a
                      href={selectedIncident.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block"
                    >
                      Download Audio →
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex gap-3">
                <button 
                  onClick={() => setSelectedIncident(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
