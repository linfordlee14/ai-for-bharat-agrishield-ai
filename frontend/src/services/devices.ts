import apiClient, { retryRequest, MOCK_MODE } from './api'
import { mockGetDevices, mockGetDevice, mockUpdateDeviceConfig, mockRunDiagnostics } from '../mocks/mockApi'
import type { Device, DevicesResponse, UpdateDeviceConfigRequest } from '@/types'

export const devicesService = {
  // Get all devices
  getDevices: async (): Promise<DevicesResponse> => {
    if (MOCK_MODE) {
      return mockGetDevices()
    }
    
    return retryRequest(async () => {
      const response = await apiClient.get<DevicesResponse>('/devices')
      return response.data
    })
  },

  // Get single device by ID
  getDeviceById: async (deviceId: string): Promise<Device> => {
    if (MOCK_MODE) {
      return mockGetDevice(deviceId)
    }
    
    return retryRequest(async () => {
      const response = await apiClient.get<Device>(`/devices/${deviceId}`)
      return response.data
    })
  },

  // Update device configuration (admin only)
  updateDeviceConfig: async (request: UpdateDeviceConfigRequest): Promise<void> => {
    if (MOCK_MODE) {
      await mockUpdateDeviceConfig(request.device_id, request.configuration)
      return
    }
    
    await apiClient.put(`/devices/${request.device_id}/config`, {
      configuration: request.configuration,
    })
  },

  // Trigger device diagnostics (admin only)
  triggerDiagnostics: async (deviceId: string): Promise<void> => {
    if (MOCK_MODE) {
      await mockRunDiagnostics(deviceId)
      return
    }
    
    await apiClient.post(`/diagnostics/${deviceId}`)
  },
}
