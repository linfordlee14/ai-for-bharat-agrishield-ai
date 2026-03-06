import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { devicesService } from '@/services/devices'
import type { UpdateDeviceConfigRequest } from '@/types'
import toast from 'react-hot-toast'

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesService.getDevices(),
    staleTime: 60000, // 1 minute
  })
}

export const useDeviceById = (deviceId: string) => {
  return useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => devicesService.getDeviceById(deviceId),
    enabled: !!deviceId,
  })
}

export const useUpdateDeviceConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: UpdateDeviceConfigRequest) =>
      devicesService.updateDeviceConfig(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['device', variables.device_id] })
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success('Device configuration updated successfully')
    },
    onError: () => {
      toast.error('Failed to update device configuration')
    },
  })
}

export const useTriggerDiagnostics = () => {
  return useMutation({
    mutationFn: (deviceId: string) => devicesService.triggerDiagnostics(deviceId),
    onSuccess: () => {
      toast.success('Diagnostics triggered successfully')
    },
    onError: () => {
      toast.error('Failed to trigger diagnostics')
    },
  })
}
