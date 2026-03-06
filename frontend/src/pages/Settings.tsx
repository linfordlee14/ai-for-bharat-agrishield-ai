import { useState } from 'react'
import { Header, Badge } from '../components'
import { useDevices } from '../hooks/useDevices'

export function Settings() {
  const { data } = useDevices()
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [config, setConfig] = useState({
    confidence_threshold: 0.7,
    frame_rate: 15,
    deterrence_enabled: true,
    monitoring_start: '06:00',
    monitoring_end: '20:00',
    sync_interval: 900,
  })

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId)
    const device = data?.devices.find(d => d.device_id === deviceId)
    if (device) {
      setConfig({
        confidence_threshold: device.configuration.confidence_threshold,
        frame_rate: device.configuration.frame_rate,
        deterrence_enabled: device.configuration.deterrence_enabled,
        monitoring_start: device.configuration.monitoring_hours.start,
        monitoring_end: device.configuration.monitoring_hours.end,
        sync_interval: device.configuration.sync_interval_seconds,
      })
    }
  }

  const handleSave = () => {
    // In real implementation, this would call the API
    alert('Configuration saved! (Demo mode - changes not persisted)')
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Configure device settings and system preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Select Device</h2>
                <div className="space-y-2">
                  {data?.devices.map((device) => (
                    <button
                      key={device.device_id}
                      onClick={() => handleDeviceSelect(device.device_id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedDevice === device.device_id
                          ? 'bg-green-50 border-2 border-green-600'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{device.location_name}</p>
                        <Badge variant={device.status === 'Online' ? 'success' : 'danger'}>
                          {device.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{device.device_id}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              {!selectedDevice ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">Select a device to configure its settings</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="font-semibold text-gray-900 mb-6">Device Configuration</h2>
                  
                  <div className="space-y-6">
                    {/* Detection Settings */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Detection Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confidence Threshold
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="0.95"
                            step="0.05"
                            value={config.confidence_threshold}
                            onChange={(e) => setConfig({ ...config, confidence_threshold: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>0.5 (More detections)</span>
                            <span className="font-medium">{config.confidence_threshold}</span>
                            <span>0.95 (Fewer, more accurate)</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frame Rate (fps)
                          </label>
                          <select
                            value={config.frame_rate}
                            onChange={(e) => setConfig({ ...config, frame_rate: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="5">5 fps (Low power)</option>
                            <option value="10">10 fps (Balanced)</option>
                            <option value="15">15 fps (Recommended)</option>
                            <option value="20">20 fps (High accuracy)</option>
                            <option value="30">30 fps (Maximum)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Deterrence Settings */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">Deterrence Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Enable Deterrence System
                            </label>
                            <p className="text-sm text-gray-500">
                              Automatically trigger audio deterrents for high-threat detections
                            </p>
                          </div>
                          <button
                            onClick={() => setConfig({ ...config, deterrence_enabled: !config.deterrence_enabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              config.deterrence_enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                config.deterrence_enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Monitoring Schedule */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">Monitoring Schedule</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={config.monitoring_start}
                            onChange={(e) => setConfig({ ...config, monitoring_start: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={config.monitoring_end}
                            onChange={(e) => setConfig({ ...config, monitoring_end: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sync Settings */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">Sync Settings</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sync Interval (seconds)
                        </label>
                        <select
                          value={config.sync_interval}
                          onChange={(e) => setConfig({ ...config, sync_interval: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="300">5 minutes (Frequent)</option>
                          <option value="600">10 minutes</option>
                          <option value="900">15 minutes (Recommended)</option>
                          <option value="1800">30 minutes</option>
                          <option value="3600">1 hour (Low bandwidth)</option>
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-200 flex gap-3">
                      <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Save Configuration
                      </button>
                      <button
                        onClick={() => handleDeviceSelect(selectedDevice)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Settings */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">System Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Demo Mode</p>
                  <p className="text-sm text-gray-500">Using mock data for demonstration</p>
                </div>
                <Badge variant="primary">Active</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">API Connection</p>
                  <p className="text-sm text-gray-500">Backend API status</p>
                </div>
                <Badge variant="warning">Mock Mode</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Version</p>
                  <p className="text-sm text-gray-500">AgriShield AI System</p>
                </div>
                <span className="text-gray-600">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
