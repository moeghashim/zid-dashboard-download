import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ApiProvider } from './contexts/ApiContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectionPlan from './pages/ProjectionPlan'
import EnhancedBrandPerformance from './pages/EnhancedBrandPerformance'
import Header from './components/Header'
import './App.css'
import { useEffect } from 'react'

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </AuthProvider>
  )
}

function AppContent() {
  const { user, isAdmin } = useAuth()

  // Add CSS classes for Manus layout editing control
  useEffect(() => {
    const body = document.body
    
    // Remove existing classes
    body.classList.remove('admin-user', 'guest-user', 'login-page')
    
    if (!user) {
      body.classList.add('login-page')
    } else if (isAdmin()) {
      body.classList.add('admin-user')
    } else {
      body.classList.add('guest-user')
    }
    
    return () => {
      // Cleanup on unmount
      body.classList.remove('admin-user', 'guest-user', 'login-page')
    }
  }, [user, isAdmin])

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/projection-plan" element={
            <ProtectedRoute>
              <ProjectionPlan />
            </ProtectedRoute>
          } />
          <Route path="/brand-performance" element={
            <ProtectedRoute>
              <EnhancedBrandPerformance />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground">Zid Global Analytics</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive revenue projection and brand performance management
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                Real-time Analytics Platform
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

