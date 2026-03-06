import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format Unix timestamp to readable date string
 */
export const formatTimestamp = (timestamp: number, formatStr = 'PPpp'): string => {
  return format(new Date(timestamp * 1000), formatStr)
}

/**
 * Format Unix timestamp to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true })
}

/**
 * Convert Date to Unix timestamp
 */
export const dateToTimestamp = (date: Date): number => {
  return Math.floor(date.getTime() / 1000)
}

/**
 * Get start of day timestamp
 */
export const getStartOfDay = (date: Date): number => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return dateToTimestamp(start)
}

/**
 * Get end of day timestamp
 */
export const getEndOfDay = (date: Date): number => {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return dateToTimestamp(end)
}
