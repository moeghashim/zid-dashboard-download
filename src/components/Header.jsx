import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { LogOut, User, Shield, BarChart3, FileText, Package } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/projection-plan', label: 'Projection Plan', icon: FileText },
    { path: '/brand-performance', label: 'Brand Performance', icon: Package },
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zid Global</h1>
              <p className="text-sm text-gray-500">Revenue Analytics Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">@{user?.username}</div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin() ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Guest
                  </Badge>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="px-6 py-0">
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

