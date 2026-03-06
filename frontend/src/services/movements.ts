import apiClient, { retryRequest } from './api'
import type { MovementEventsResponse, Species } from '@/types'

export const movementsService = {
  // Get movement events
  getMovements: async (
    species?: Species,
    startDate?: number,
    endDate?: number
  ): Promise<MovementEventsResponse> => {
    return retryRequest(async () => {
      const response = await apiClient.get<MovementEventsResponse>('/movements', {
        params: { species, start_date: startDate, end_date: endDate },
      })
      return response.data
    })
  },
}
