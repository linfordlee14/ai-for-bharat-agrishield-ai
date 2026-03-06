import apiClient, { retryRequest, MOCK_MODE } from './api'
import { mockGetIncidents, mockGetIncident, mockExportIncidents } from '../mocks/mockApi'
import type { Incident, IncidentsResponse, IncidentQueryParams } from '@/types'

export const incidentsService = {
  // Get incidents with filters
  getIncidents: async (params?: IncidentQueryParams): Promise<IncidentsResponse> => {
    if (MOCK_MODE) {
      return mockGetIncidents(params)
    }
    
    return retryRequest(async () => {
      const response = await apiClient.get<IncidentsResponse>('/incidents', { params })
      return response.data
    })
  },

  // Get single incident by ID
  getIncidentById: async (id: string): Promise<Incident> => {
    if (MOCK_MODE) {
      return mockGetIncident(id)
    }
    
    return retryRequest(async () => {
      const response = await apiClient.get<Incident>(`/incidents/${id}`)
      return response.data
    })
  },

  // Export incidents to CSV
  exportIncidents: async (params?: IncidentQueryParams): Promise<Blob> => {
    if (MOCK_MODE) {
      return mockExportIncidents(params)
    }
    
    const response = await apiClient.get('/export/incidents', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
