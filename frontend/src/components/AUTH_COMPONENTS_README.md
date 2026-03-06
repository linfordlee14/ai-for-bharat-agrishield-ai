# Authentication Components

This module provides UI components for authentication and authorization in the AgriShield AI Ranger Dashboard.

## Components

### Login Page

A full-page login form with email and password fields.

**Features:**
- Email and password input fields
- Form validation
- Error message display
- Loading state during authentication
- Redirects to dashboard on successful login

**Requirements Validated:**
- **10.1**: Authenticate users via Amazon Cognito User Pool
- **10.2**: Send login credentials to Cognito for validation

**Usage:**
```tsx
import { Login } from './pages'

<Route path="/login" element={<Login />} />
```

### ProtectedRoute

A wrapper component that guards authenticated routes. Redirects to login if user is not authenticated.

**Features:**
- Checks authentication status on mount
- Attempts to restore session from storage
- Shows loading spinner while checking
- Redirects to `/login` if not authenticated
- Renders children if authenticated

**Requirements Validated:**
- **10.6**: Redirect to login page when JWT token expires

**Usage:**
```tsx
import { ProtectedRoute } from './components'

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### RoleGuard

A component that enforces role-based access control. Shows children only if user has required role.

**Features:**
- Checks user role from stored session
- Admin role has access to everything
- Supports fallback content for unauthorized users
- Hides content if user doesn't have required role

**Requirements Validated:**
- **10.7**: Support two user roles (ranger and admin)
- **10.8**: Deny requests from rangers to modify device settings

**Usage:**
```tsx
import { RoleGuard } from './components'

// Only show to admins
<RoleGuard requiredRole="admin">
  <DeviceConfigEditor />
</RoleGuard>

// Show fallback for unauthorized users
<RoleGuard 
  requiredRole="admin" 
  fallback={<div>Admin access required</div>}
>
  <DeviceConfigEditor />
</RoleGuard>
```

### Header

A header component that displays user information and logout button.

**Features:**
- Displays user name and role badge
- Color-coded role badge (red for admin, orange for ranger)
- Logout button
- Clears session and redirects to login on logout

**Requirements Validated:**
- **10.9**: Clear all session data and invalidate JWT token on logout

**Usage:**
```tsx
import { Header } from './components'

function Dashboard() {
  return (
    <div>
      <Header />
      <main>
        {/* Dashboard content */}
      </main>
    </div>
  )
}
```

## Authentication Flow

1. **User visits protected route** → ProtectedRoute checks authentication
2. **Not authenticated** → Redirect to `/login`
3. **User submits login form** → Login page calls `auth.login()`
4. **Cognito validates credentials** → Returns JWT token
5. **Token stored in session** → User redirected to `/dashboard`
6. **Protected route renders** → User sees dashboard with Header
7. **User clicks logout** → Header calls `auth.logout()`, clears session, redirects to login

## Role-Based Access

The system supports two roles:

- **ranger**: Read-only access to incidents and devices
- **admin**: Full access including device configuration and diagnostics

Use `RoleGuard` to conditionally render UI elements based on role:

```tsx
// Show device config editor only to admins
<RoleGuard requiredRole="admin">
  <button onClick={openConfigEditor}>Edit Configuration</button>
</RoleGuard>

// Show different content based on role
{user.role === 'admin' ? (
  <AdminDashboard />
) : (
  <RangerDashboard />
)}
```

## Session Management

- JWT tokens are stored in `sessionStorage` (cleared when browser tab closes)
- Tokens expire after 1 hour
- Automatic token refresh every 45 minutes (handled by auth service)
- On token expiration, user is redirected to login
- On logout, all session data is cleared

## Testing

Run the test suite:

```bash
npm test -- ProtectedRoute.test.tsx RoleGuard.test.tsx
```

The tests cover:
- ProtectedRoute authentication checks
- ProtectedRoute loading states
- ProtectedRoute redirects
- RoleGuard role checking
- RoleGuard admin access
- RoleGuard fallback rendering

## Security Considerations

1. **Session Storage**: Tokens stored in session storage (not local storage)
2. **Protected Routes**: All authenticated routes wrapped in ProtectedRoute
3. **Role Enforcement**: RoleGuard enforces role-based access at UI level
4. **API Enforcement**: Backend also enforces role-based access (defense in depth)
5. **Token Expiration**: Automatic redirect on token expiration
6. **Logout Cleanup**: All session data cleared on logout

## Integration with API

The authentication components work seamlessly with the API client:

1. Login stores JWT token in session storage
2. API client reads token from session storage
3. API client includes token in Authorization header
4. API client handles 401 responses (redirects to login)

See `services/api.ts` for API integration details.

## Future Enhancements

- Remember me functionality
- Multi-factor authentication (MFA)
- Password reset flow in UI
- Session timeout warnings
- Biometric authentication for mobile
