import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard } from './RoleGuard'
import * as auth from '../services/auth'

// Mock the auth service
vi.mock('../services/auth', () => ({
  getStoredUser: vi.fn(),
}))

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nothing if no user is logged in', () => {
    vi.mocked(auth.getStoredUser).mockReturnValue(null)
    
    const { container } = render(
      <RoleGuard requiredRole="admin">
        <div>Admin Content</div>
      </RoleGuard>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render fallback if no user is logged in and fallback provided', () => {
    vi.mocked(auth.getStoredUser).mockReturnValue(null)
    
    render(
      <RoleGuard requiredRole="admin" fallback={<div>Access Denied</div>}>
        <div>Admin Content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should render children if user has required role', () => {
    vi.mocked(auth.getStoredUser).mockReturnValue({
      user_id: '123',
      email: 'ranger@example.com',
      role: 'ranger',
      name: 'Test Ranger',
    })
    
    render(
      <RoleGuard requiredRole="ranger">
        <div>Ranger Content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Ranger Content')).toBeInTheDocument()
  })

  it('should render children if user is admin (admin has access to everything)', () => {
    vi.mocked(auth.getStoredUser).mockReturnValue({
      user_id: '123',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Test Admin',
    })
    
    render(
      <RoleGuard requiredRole="ranger">
        <div>Ranger Content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Ranger Content')).toBeInTheDocument()
  })

  it('should not render children if user does not have required role', () => {
    vi.mocked(auth.getStoredUser).mockReturnValue({
      user_id: '123',
      email: 'ranger@example.com',
      role: 'ranger',
      name: 'Test Ranger',
    })
    
    const { container } = render(
      <RoleGuard requiredRole="admin">
        <div>Admin Content</div>
      </RoleGuard>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render fallback if user does not have required role and fallback provided', () => {
    vi.mocked(auth.getStoredUser).mockReturnValue({
      user_id: '123',
      email: 'ranger@example.com',
      role: 'ranger',
      name: 'Test Ranger',
    })
    
    render(
      <RoleGuard requiredRole="admin" fallback={<div>Admin Only</div>}>
        <div>Admin Content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Admin Only')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})
