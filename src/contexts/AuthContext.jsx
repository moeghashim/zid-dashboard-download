import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zid_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        
        // Validate session data integrity
        if (parsedUser && 
            parsedUser.id && 
            parsedUser.username && 
            parsedUser.role && 
            ['admin', 'guest'].includes(parsedUser.role)) {
          setUser(parsedUser)
        } else {
          // Invalid session data, clear it
          localStorage.removeItem('zid_user')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('zid_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username, password) => {
    // Simple authentication logic
    // In a real app, this would make an API call with proper encryption
    
    // Trim and validate input
    const cleanUsername = username.trim().toLowerCase()
    const cleanPassword = password.trim()
    
    // Basic input validation
    if (!cleanUsername || !cleanPassword) {
      return { success: false, error: 'Username and password are required' }
    }
    
    if (cleanUsername.length < 3 || cleanPassword.length < 6) {
      return { success: false, error: 'Invalid credentials format' }
    }
    
    // Authentication check
    if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
      const adminUser = {
        id: 1,
        username: 'admin',
        role: 'admin',
        name: 'Administrator',
        loginTime: new Date().toISOString()
      }
      setUser(adminUser)
      localStorage.setItem('zid_user', JSON.stringify(adminUser))
      return { success: true, user: adminUser }
    } else if (cleanUsername === 'guest' && cleanPassword === 'guest123') {
      const guestUser = {
        id: 2,
        username: 'guest',
        role: 'guest',
        name: 'Guest User',
        loginTime: new Date().toISOString()
      }
      setUser(guestUser)
      localStorage.setItem('zid_user', JSON.stringify(guestUser))
      return { success: true, user: guestUser }
    } else {
      return { success: false, error: 'Invalid username or password' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('zid_user')
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isGuest = () => {
    return user?.role === 'guest'
  }

  const isAuthenticated = () => {
    return !!user
  }

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isGuest,
    isAuthenticated,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

