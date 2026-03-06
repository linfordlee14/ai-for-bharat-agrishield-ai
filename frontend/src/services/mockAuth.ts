/**
 * Mock authentication for demo mode
 * Bypasses Cognito and uses local mock users
 */

import { User } from '../types'
import { mockLogin as mockApiLogin, mockLogout as mockApiLogout } from '../mocks/mockApi'

/**
 * Mock login - bypasses Cognito
 */
export const mockLogin = async (email: string, password: string): Promise<User> => {
  return mockApiLogin(email, password)
}

/**
 * Mock logout
 */
export const mockLogout = async (): Promise<void> => {
  return mockApiLogout()
}

/**
 * Check if user is authenticated (mock mode)
 */
export const mockIsAuthenticated = (): boolean => {
  const token = sessionStorage.getItem('auth_token')
  const user = sessionStorage.getItem('user')
  return !!(token && user)
}

/**
 * Get stored user (mock mode)
 */
export const mockGetStoredUser = (): User | null => {
  const userJson = sessionStorage.getItem('user')
  if (!userJson) return null
  
  try {
    return JSON.parse(userJson) as User
  } catch {
    return null
  }
}

/**
 * Get token (mock mode)
 */
export const mockGetToken = (): string | null => {
  return sessionStorage.getItem('auth_token')
}

/**
 * Initialize auth (mock mode)
 */
export const mockInitializeAuth = async (): Promise<User | null> => {
  const user = mockGetStoredUser()
  const token = mockGetToken()
  
  if (user && token) {
    return user
  }
  
  return null
}
