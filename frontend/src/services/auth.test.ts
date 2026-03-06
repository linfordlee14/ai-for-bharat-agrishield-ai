import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getToken,
  getStoredUser,
  isAuthenticated,
} from './auth'
import { User } from '../types'

describe('Authentication Service - Storage Functions', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear()
  })
  
  afterEach(() => {
    sessionStorage.clear()
  })
  
  describe('getToken', () => {
    it('should return stored token', () => {
      sessionStorage.setItem('auth_token', 'test-token')
      
      expect(getToken()).toBe('test-token')
    })
    
    it('should return null if no token stored', () => {
      expect(getToken()).toBeNull()
    })
  })
  
  describe('getStoredUser', () => {
    it('should return stored user', () => {
      const user: User = {
        user_id: '123',
        email: 'test@example.com',
        role: 'admin',
        name: 'Test User',
      }
      
      sessionStorage.setItem('user', JSON.stringify(user))
      
      expect(getStoredUser()).toEqual(user)
    })
    
    it('should return null if no user stored', () => {
      expect(getStoredUser()).toBeNull()
    })
    
    it('should return null if stored data is invalid JSON', () => {
      sessionStorage.setItem('user', 'invalid-json')
      
      expect(getStoredUser()).toBeNull()
    })
  })
  
  describe('isAuthenticated', () => {
    it('should return true when token and user are present', () => {
      sessionStorage.setItem('auth_token', 'test-token')
      sessionStorage.setItem('user', JSON.stringify({ 
        user_id: '123', 
        email: 'test@example.com',
        role: 'ranger',
        name: 'Test User'
      }))
      
      expect(isAuthenticated()).toBe(true)
    })
    
    it('should return false when token is missing', () => {
      sessionStorage.setItem('user', JSON.stringify({ 
        user_id: '123', 
        email: 'test@example.com',
        role: 'ranger',
        name: 'Test User'
      }))
      
      expect(isAuthenticated()).toBe(false)
    })
    
    it('should return false when user is missing', () => {
      sessionStorage.setItem('auth_token', 'test-token')
      
      expect(isAuthenticated()).toBe(false)
    })
    
    it('should return false when both are missing', () => {
      expect(isAuthenticated()).toBe(false)
    })
  })
  
  describe('Token and User Storage', () => {
    it('should store and retrieve JWT token in session storage', () => {
      const token = 'jwt-token-12345'
      sessionStorage.setItem('auth_token', token)
      
      expect(getToken()).toBe(token)
    })
    
    it('should store and retrieve user in session storage', () => {
      const user: User = {
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        name: 'Test User',
      }
      
      sessionStorage.setItem('user', JSON.stringify(user))
      
      expect(getStoredUser()).toEqual(user)
    })
    
    it('should handle ranger role', () => {
      const user: User = {
        user_id: 'user-456',
        email: 'ranger@example.com',
        role: 'ranger',
        name: 'Ranger User',
      }
      
      sessionStorage.setItem('user', JSON.stringify(user))
      
      const storedUser = getStoredUser()
      expect(storedUser?.role).toBe('ranger')
    })
    
    it('should handle admin role', () => {
      const user: User = {
        user_id: 'user-789',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
      }
      
      sessionStorage.setItem('user', JSON.stringify(user))
      
      const storedUser = getStoredUser()
      expect(storedUser?.role).toBe('admin')
    })
  })
  
  describe('Session Storage Integration', () => {
    it('should use session storage (not local storage)', () => {
      const token = 'test-token'
      const user: User = {
        user_id: '123',
        email: 'test@example.com',
        role: 'ranger',
        name: 'Test User',
      }
      
      sessionStorage.setItem('auth_token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      
      // Verify it's in session storage
      expect(sessionStorage.getItem('auth_token')).toBe(token)
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify(user))
      
      // Verify it's NOT in local storage
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
    
    it('should clear all auth data from session storage', () => {
      sessionStorage.setItem('auth_token', 'test-token')
      sessionStorage.setItem('user', JSON.stringify({ user_id: '123' }))
      sessionStorage.setItem('refresh_token', 'refresh-token')
      
      // Clear all
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('refresh_token')
      
      expect(sessionStorage.getItem('auth_token')).toBeNull()
      expect(sessionStorage.getItem('user')).toBeNull()
      expect(sessionStorage.getItem('refresh_token')).toBeNull()
    })
  })
})
