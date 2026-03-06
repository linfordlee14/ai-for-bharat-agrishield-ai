import { useState } from 'react'
import { Header, LoadingSpinner, ErrorMessage, Badge } from '../components'
import { useDevices } from '../hooks/useDevices'
import { formatTimestamp, formatDuration } from '../utils/format'
import type { Device } from '../types'

export function Devices() {
  const { data, isLoading, error } = useDevices()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')

  const filteredDevices = data?.devices.filter(device => {
    if (filter === 'all') return true
    return device.status.toLowerCase() === filter
  }) || []

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device)
  }

  const getStatusColor = (status: string): 'success' | 'danger' => {
    return status === 'Online' ? 'success' : 'danger'
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Device Management</h1>
            <p className="text-gray-600">Monitor and manage your AgriShield devices</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Devices ({data?.devices.length || 0})
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'online'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Online ({data?.devices.filter(d => d.status === 'Online').length || 0})
            </button>
            <button
              onClick={() => setFilter('offline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'offline'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Offline ({data?.devices.filter(d => d.status === 'Offline').length || 0})
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <div
                  key={device.device_id}
                  onClick={() => handleDeviceClick(device)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {device.location_name}
                      </h3>
                      <p className="text-sm text-gray-500">{device.device_id}</p>
                    </div>
                    <Badge variant={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Seen:</span>
                      <span className="font-medium text-gray-900">
                        {formatDuration(Math.floor(Date.now() / 1000) - device.last_seen)} ago
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Firmware:</span>
                      <span className="font-medium text-gray-900">{device.firmware_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium text-gray-900">{device.model_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deterrence:</span>
                      <span className={`font-medium ${device.configuration.deterrence_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {device.configuration.deterrence_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      📍 {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data && filteredDevices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No devices found matching the filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedDevice.location_name}
                  </h2>
                  <p className="text-gray-500">{selectedDevice.device_id}</p>
                </div>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={getStatusColor(selectedDevice.status)}>
                        {selectedDevice.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Seen</p>
                      <p className="font-medium">{formatTimestamp(selectedDevice.last_seen)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Latitude</p>
                      <p className="font-medium">{selectedDevice.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Longitude</p>
                      <p className="font-medium">{selectedDevice.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Software</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Firmware Version</p>
                      <p className="font-medium">{selectedDevice.firmware_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Model Version</p>
                      <p className="font-medium">{selectedDevice.model_version}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence Threshold</span>
                      <span className="font-medium">{selectedDevice.configuration.confidence_threshold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frame Rate</span>
                      <span className="font-medium">{selectedDevice.configuration.frame_rate} fps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deterrence</span>
                      <span className={`font-medium ${selectedDevice.configuration.deterrence_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedDevice.configuration.deterrence_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monitoring Hours</span>
                      <span className="font-medium">
                        {selectedDevice.configuration.monitoring_hours.start} - {selectedDevice.configuration.monitoring_hours.end}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sync Interval</span>
                      <span className="font-medium">{selectedDevice.configuration.sync_interval_seconds}s</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Alert Contacts</h3>
                  <div className="space-y-2">
                    {selectedDevice.phone_numbers.map((phone, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-gray-600">📱</span>
                        <span className="font-medium">{phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Configure Device
                </button>
                <button 
                  onClick={() => setSelectedDevice(null)}
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
