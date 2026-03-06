import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import * as auth from '../services/auth'

// Mock the auth service
vi.mock('../services/auth', () => ({
  isAuthenticated: vi.fn(),
  initializeAuth: vi.fn(),
}))

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div>Redirecting to {to}</div>,
  }
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading spinner while checking authentication', () => {
    vi.mocked(auth.initializeAuth).mockImplementation(() => new Promise(() => {}))
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText((_content, element) => {
      return element?.className?.includes('animate-spin') || false
    })).toBeInTheDocument()
  })

  it('should redirect to login if not authenticated', async () => {
    vi.mocked(auth.initializeAuth).mockResolvedValue(null)
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Redirecting to /login')).toBeInTheDocument()
    })
  })

  it('should render children if authenticated', async () => {
    vi.mocked(auth.initializeAuth).mockResolvedValue({
      user_id: '123',
      email: 'test@example.com',
      role: 'ranger',
      name: 'Test User',
    })
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})
