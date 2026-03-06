import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { incidentsService } from '@/services/incidents'
import type { IncidentsResponse, IncidentQueryParams } from '@/types'

export const useIncidents = (
  params?: IncidentQueryParams
): UseQueryResult<IncidentsResponse, Error> => {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => incidentsService.getIncidents(params),
    staleTime: 30000, // 30 seconds
  })
}

export const useIncidentById = (id: string) => {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsService.getIncidentById(id),
    enabled: !!id,
  })
}
