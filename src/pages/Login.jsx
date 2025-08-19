import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  // Add login-page class to body for Manus layout editing control
  React.useEffect(() => {
    document.body.classList.add('login-page')
    
    return () => {
      document.body.classList.remove('login-page')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = login(username, password)
      if (!result.success) {
        setError(result.error)
      }
    } catch {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setUsername('admin')
      setPassword('admin123')
    } else {
      setUsername('guest')
      setPassword('guest123')
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Zid Global</h1>
          </div>
          <p className="text-gray-600">Revenue Analytics Platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Choose your access level to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Login Options */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Quick Login Option:</div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleQuickLogin('guest')}
                  className="flex items-center gap-2 h-auto py-3 px-6"
                >
                  <User className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Guest Access</div>
                    <div className="text-xs text-muted-foreground">Read Only Dashboard</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Demo Access:</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">Guest</Badge>
                    <span className="text-gray-600">Read-only access available</span>
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Full admin access requires valid credentials
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Zid Global. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

