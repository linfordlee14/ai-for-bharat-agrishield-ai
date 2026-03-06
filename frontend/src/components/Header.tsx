import { useNavigate, Link, useLocation } from 'react-router-dom'
import { logout, getStoredUser } from '../services/auth'
import { mockLogout, mockGetStoredUser } from '../services/mockAuth'
import { MOCK_MODE } from '../services/api'
import { Badge } from './Badge'

/**
 * Header component displays user info and logout button
 * Validates: Requirements 10.9
 */
export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = MOCK_MODE ? mockGetStoredUser() : getStoredUser()

  const handleLogout = async () => {
    if (MOCK_MODE) {
      await mockLogout()
    } else {
      await logout()
    }
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  if (!user) {
    return null
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                AgriShield AI
              </h1>
              {MOCK_MODE && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  DEMO MODE
                </span>
              )}
            </div>
            
            <nav className="flex gap-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/incidents"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/incidents')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Incidents
              </Link>
              <Link
                to="/devices"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/devices')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Devices
              </Link>
              <Link
                to="/settings"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{user.name}</span>
              <Badge 
                variant={user.role === 'admin' ? 'danger' : 'warning'}
              >
                {user.role.toUpperCase()}
              </Badge>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
