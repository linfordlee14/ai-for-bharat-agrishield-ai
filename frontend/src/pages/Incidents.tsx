import { useState } from 'react'
import { Header, LoadingSpinner, ErrorMessage, Badge } from '../components'
import { useIncidents } from '../hooks/useIncidents'
import { formatTimestamp } from '../utils/format'
import { exportToCSV, exportToJSON } from '../utils/export'
import type { Incident } from '../types'

export function Incidents() {
  const { data, isLoading, error } = useIncidents()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [filter, setFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all')
  const [speciesFilter, setSpeciesFilter] = useState<string>('all')

  const filteredIncidents = data?.incidents.filter(incident => {
    const threatMatch = filter === 'all' || incident.threat_level === filter
    const speciesMatch = speciesFilter === 'all' || incident.species === speciesFilter
    return threatMatch && speciesMatch
  }) || []

  const uniqueSpecies = Array.from(new Set(data?.incidents.map(i => i.species) || []))

  const getThreatColor = (level: string): 'success' | 'warning' | 'danger' | 'primary' | 'gray' => {
    switch (level) {
      case 'HIGH': return 'danger'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'primary'
      default: return 'gray'
    }
  }

  const handleExportCSV = () => {
    if (filteredIncidents.length > 0) {
      exportToCSV(filteredIncidents, 'agrishield-incidents')
    }
  }

  const handleExportJSON = () => {
    if (filteredIncidents.length > 0) {
      exportToJSON(filteredIncidents, 'agrishield-incidents')
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Incident History</h1>
              <p className="text-gray-600">View and analyze wildlife detection incidents</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Threat Level</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({data?.incidents.length || 0})
                </button>
                <button
                  onClick={() => setFilter('HIGH')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'HIGH'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  High ({data?.incidents.filter(i => i.threat_level === 'HIGH').length || 0})
                </button>
                <button
                  onClick={() => setFilter('MEDIUM')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'MEDIUM'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Medium ({data?.incidents.filter(i => i.threat_level === 'MEDIUM').length || 0})
                </button>
                <button
                  onClick={() => setFilter('LOW')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'LOW'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Low ({data?.incidents.filter(i => i.threat_level === 'LOW').length || 0})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Species</option>
                {uniqueSpecies.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-64">
              <ErrorMessage message={error.message} />
            </div>
          )}
          
          {data && !isLoading && !error && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Species
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Threat Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIncidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(incident.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {incident.species}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getThreatColor(incident.threat_level)}>
                            {incident.threat_level}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(incident.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.device_id.split('-').pop()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedIncident(incident)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredIncidents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No incidents found matching the filters</p>
                </div>
              )}
            </div>
          )}
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
