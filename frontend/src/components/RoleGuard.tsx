import { ReactNode } from 'react'
import { getStoredUser } from '../services/auth'
import { UserRole } from '../types'

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole
  fallback?: ReactNode
}

/**
 * RoleGuard component enforces role-based access control
 * Shows children only if user has required role
 * Validates: Requirements 10.7, 10.8
 */
export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const user = getStoredUser()

  if (!user) {
    return fallback ? <>{fallback}</> : null
  }

  // Admin has access to everything
  if (user.role === 'admin') {
    return <>{children}</>
  }

  // Check if user has required role
  if (user.role === requiredRole) {
    return <>{children}</>
  }

  // User doesn't have required role
  return fallback ? <>{fallback}</> : null
}
