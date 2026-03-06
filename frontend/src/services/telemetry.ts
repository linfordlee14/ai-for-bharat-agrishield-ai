import apiClient, { retryRequest } from './api'
import type { TelemetryResponse } from '@/types'

export const telemetryService = {
  // Get telemetry for a device
  getDeviceTelemetry: async (
    deviceId: string,
    startDate?: number,
    endDate?: number
  ): Promise<TelemetryResponse> => {
    return retryRequest(async () => {
      const response = await apiClient.get<TelemetryResponse>(`/telemetry/${deviceId}`, {
        params: { start_date: startDate, end_date: endDate },
      })
      return response.data
    })
  },
}
