import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { initializeAuth } from '../services/auth'
import { mockInitializeAuth } from '../services/mockAuth'
import { MOCK_MODE } from '../services/api'
import { LoadingSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component guards authenticated routes
 * Redirects to login if user is not authenticated
 * Validates: Requirements 10.6
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Try to restore session from storage
      const user = MOCK_MODE ? await mockInitializeAuth() : await initializeAuth()
      setAuthenticated(!!user)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
