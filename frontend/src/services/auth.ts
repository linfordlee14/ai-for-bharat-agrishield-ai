import {
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js'
import { User, UserRole } from '../types'

// Cognito configuration from environment variables
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID

// Check if Cognito is configured
const isCognitoConfigured = !!(COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID)

if (!isCognitoConfigured) {
  console.warn('⚠️ Cognito configuration missing. Real authentication will not work. Use MOCK_MODE=true for development.')
}

// Initialize Cognito User Pool (will be empty if not configured)
const userPool = isCognitoConfigured ? new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
}) : null

// Token storage keys
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Token refresh interval (45 minutes - tokens expire in 1 hour)
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000

let refreshTimer: NodeJS.Timeout | null = null

/**
 * Extract user role from JWT token claims
 */
const extractUserRole = (session: CognitoUserSession): UserRole => {
  const idToken = session.getIdToken()
  const payload = idToken.decodePayload()
  
  // Role can be in custom:role or cognito:groups
  const role = payload['custom:role'] || payload['cognito:groups']?.[0] || 'ranger'
  
  return role as UserRole
}

/**
 * Extract user information from Cognito session
 */
const extractUserInfo = (cognitoUser: CognitoUser, session: CognitoUserSession): User => {
  const idToken = session.getIdToken()
  const payload = idToken.decodePayload()
  
  return {
    user_id: payload.sub,
    email: payload.email || cognitoUser.getUsername(),
    role: extractUserRole(session),
    name: payload.name || payload.email || cognitoUser.getUsername(),
  }
}

/**
 * Store authentication tokens in session storage
 */
const storeTokens = (session: CognitoUserSession): void => {
  const idToken = session.getIdToken().getJwtToken()
  const refreshToken = session.getRefreshToken().getToken()
  
  sessionStorage.setItem(TOKEN_KEY, idToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * Store user information in session storage
 */
const storeUser = (user: User): void => {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Clear all authentication data from session storage
 */
const clearAuthData = (): void => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/**
 * Get stored JWT token
 */
export const getToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Get stored user information
 */
export const getStoredUser = (): User | null => {
  const userJson = sessionStorage.getItem(USER_KEY)
  if (!userJson) return null
  
  try {
    return JSON.parse(userJson) as User
  } catch {
    return null
  }
}

/**
 * Refresh JWT token before expiration
 */
const refreshToken = async (): Promise<void> => {
  if (!userPool) {
    throw new Error('Cognito not configured')
  }

  return new Promise((resolve, reject) => {
    const currentUser = userPool.getCurrentUser()
    
    if (!currentUser) {
      reject(new Error('No current user'))
      return
    }
    
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('Failed to get session'))
        return
      }
      
      if (!session.isValid()) {
        // Session expired, need to re-authenticate
        clearAuthData()
        window.location.href = '/login'
        reject(new Error('Session expired'))
        return
      }
      
      // Refresh the token
      currentUser.refreshSession(
        session.getRefreshToken(),
        (refreshErr: Error | null, newSession: CognitoUserSession | null) => {
          if (refreshErr || !newSession) {
            reject(refreshErr || new Error('Failed to refresh token'))
            return
          }
          
          // Store new tokens
          storeTokens(newSession)
          resolve()
        }
      )
    })
  })
}

/**
 * Start automatic token refresh
 */
const startTokenRefresh = (): void => {
  // Clear any existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // Set up periodic token refresh
  refreshTimer = setInterval(async () => {
    try {
      await refreshToken()
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, redirect to login
      clearAuthData()
      window.location.href = '/login'
    }
  }, TOKEN_REFRESH_INTERVAL)
}

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
  if (!userPool || !isCognitoConfigured) {
    throw new Error('Cognito is not configured. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in .env file.')
  }

  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })
    
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        // Store tokens in session storage
        storeTokens(session)
        
        // Extract and store user information
        const user = extractUserInfo(cognitoUser, session)
        storeUser(user)
        
        // Start automatic token refresh
        startTokenRefresh()
        
        resolve(user)
      },
      onFailure: (err: Error) => {
        reject(err)
      },
      newPasswordRequired: (_userAttributes: any) => {
        // Handle new password required scenario
        reject(new Error('New password required. Please contact administrator.'))
      },
    })
  })
}

/**
 * Logout and invalidate tokens
 */
export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
    if (userPool) {
      const currentUser = userPool.getCurrentUser()
      
      if (currentUser) {
        // Sign out from Cognito
        currentUser.signOut()
      }
    }
    
    // Clear all session data
    clearAuthData()
    
    resolve()
  })
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken()
  const user = getStoredUser()
  
  return !!(token && user)
}

/**
 * Get current Cognito user session
 */
export const getCurrentSession = async (): Promise<CognitoUserSession | null> => {
  if (!userPool) {
    return null
  }

  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser()
    
    if (!currentUser) {
      resolve(null)
      return
    }
    
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null)
        return
      }
      
      resolve(session)
    })
  })
}

/**
 * Initialize authentication on app load
 * Checks for existing session and starts token refresh if valid
 */
export const initializeAuth = async (): Promise<User | null> => {
  if (!userPool) {
    clearAuthData()
    return null
  }

  try {
    const session = await getCurrentSession()
    
    if (!session) {
      clearAuthData()
      return null
    }
    
    const currentUser = userPool.getCurrentUser()
    if (!currentUser) {
      clearAuthData()
      return null
    }
    
    // Store tokens
    storeTokens(session)
    
    // Extract and store user info
    const user = extractUserInfo(currentUser, session)
    storeUser(user)
    
    // Start token refresh
    startTokenRefresh()
    
    return user
  } catch (error) {
    console.error('Failed to initialize auth:', error)
    clearAuthData()
    return null
  }
}

/**
 * Change user password
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  if (!userPool) {
    throw new Error('Cognito not configured')
  }

  return new Promise((resolve, reject) => {
    const currentUser = userPool.getCurrentUser()
    
    if (!currentUser) {
      reject(new Error('No current user'))
      return
    }
    
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('Failed to get session'))
        return
      }
      
      currentUser.changePassword(oldPassword, newPassword, (changeErr, _result) => {
        if (changeErr) {
          reject(changeErr)
          return
        }
        
        resolve()
      })
    })
  })
}

/**
 * Request password reset
 */
export const forgotPassword = async (email: string): Promise<void> => {
  if (!userPool) {
    throw new Error('Cognito not configured')
  }

  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })
    
    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve()
      },
      onFailure: (err: Error) => {
        reject(err)
      },
    })
  })
}

/**
 * Confirm password reset with code
 */
export const confirmPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  if (!userPool) {
    throw new Error('Cognito not configured')
  }

  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })
    
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve()
      },
      onFailure: (err: Error) => {
        reject(err)
      },
    })
  })
}
