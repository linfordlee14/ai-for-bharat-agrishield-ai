import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
vi.stubEnv('VITE_COGNITO_USER_POOL_ID', 'us-east-1_TEST123456')
vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'test-client-id-123456')
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api')
vi.stubEnv('VITE_AWS_REGION', 'us-east-1')
