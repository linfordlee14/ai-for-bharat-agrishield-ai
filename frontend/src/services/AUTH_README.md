# Authentication Service

This module provides AWS Cognito authentication integration for the AgriShield AI Ranger Dashboard.

## Features

- **Login with Cognito User Pool**: Authenticate users with email and password
- **Logout with Token Invalidation**: Clear session data and sign out from Cognito
- **JWT Token Management**: Store tokens securely in browser session storage
- **Automatic Token Refresh**: Refresh JWT tokens before expiration (every 45 minutes)
- **Role Extraction**: Extract user role (ranger/admin) from JWT claims
- **Password Management**: Change password and forgot password flows

## Requirements Validated

This implementation satisfies the following requirements from the spec:

- **10.1**: Authenticate users via Amazon Cognito User Pool
- **10.2**: Send login credentials to Cognito for validation
- **10.3**: Receive JWT token with 1-hour expiration
- **10.4**: Store JWT token securely in browser session storage
- **10.6**: Redirect to login page when JWT token expires
- **10.9**: Clear all session data and invalidate JWT token on logout

## Usage

### Login

```typescript
import { login } from './services/auth'

try {
  const user = await login('user@example.com', 'password123')
  console.log('Logged in:', user)
  // user = { user_id, email, role, name }
} catch (error) {
  console.error('Login failed:', error)
}
```

### Logout

```typescript
import { logout } from './services/auth'

await logout()
// All session data cleared, user signed out from Cognito
```

### Check Authentication Status

```typescript
import { isAuthenticated, getToken, getStoredUser } from './services/auth'

if (isAuthenticated()) {
  const token = getToken()
  const user = getStoredUser()
  console.log('User is authenticated:', user)
}
```

### Initialize Auth on App Load

```typescript
import { initializeAuth } from './services/auth'

// Call this when your app loads
const user = await initializeAuth()
if (user) {
  console.log('Session restored:', user)
} else {
  console.log('No valid session')
}
```

## Configuration

Set the following environment variables in `.env`:

```env
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_REGION=us-east-1
```

## Token Storage

- **JWT Token**: Stored in `sessionStorage` as `auth_token`
- **Refresh Token**: Stored in `sessionStorage` as `refresh_token`
- **User Info**: Stored in `sessionStorage` as `user` (JSON)

Session storage is used (not local storage) to ensure tokens are cleared when the browser tab is closed.

## Token Refresh

The service automatically refreshes JWT tokens every 45 minutes (tokens expire after 1 hour). This happens in the background without user interaction.

If token refresh fails, the user is redirected to the login page.

## Role Extraction

User roles are extracted from JWT token claims in the following order:

1. `custom:role` claim (preferred)
2. First value in `cognito:groups` array
3. Default to `ranger` if no role found

Supported roles:
- `ranger`: Read-only access
- `admin`: Full access

## API Integration

The auth service integrates with the API client (`api.ts`) which automatically includes the JWT token in the `Authorization` header for all API requests:

```typescript
Authorization: Bearer <jwt-token>
```

When the API returns a 401 status, the interceptor automatically clears session data and redirects to login.

## Security Considerations

1. **Session Storage**: Tokens are stored in session storage (not local storage) to limit exposure
2. **HTTPS Only**: Always use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Tokens expire after 1 hour and are automatically refreshed
4. **Logout Cleanup**: All session data is cleared on logout
5. **Certificate Validation**: Cognito uses TLS for all authentication requests

## Testing

Run the test suite:

```bash
npm test -- auth.test.ts
```

The tests cover:
- Token storage and retrieval
- User storage and retrieval
- Authentication status checking
- Role handling
- Session storage integration

## Error Handling

The service handles the following error scenarios:

- **Invalid Credentials**: Rejects with error message from Cognito
- **Network Errors**: Propagates network errors to caller
- **Token Expiration**: Automatically redirects to login
- **Refresh Failure**: Clears session and redirects to login
- **Missing Configuration**: Logs warning if Cognito config is missing

## Future Enhancements

- Multi-factor authentication (MFA) support
- Social login integration
- Remember me functionality
- Session timeout warnings
- Biometric authentication for mobile
