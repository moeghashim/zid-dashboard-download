import React, { createContext, useContext, useState, useEffect } from 'react'

const CloudBrandContext = createContext()

// Month options for starting month selection
export const MONTH_OPTIONS = [
  { value: 0, label: 'Oct 2025' },
  { value: 1, label: 'Nov 2025' },
  { value: 2, label: 'Dec 2025' },
  { value: 3, label: 'Jan 2026' },
  { value: 4, label: 'Feb 2026' },
  { value: 5, label: 'Mar 2026' },
  { value: 6, label: 'Apr 2026' },
  { value: 7, label: 'May 2026' },
  { value: 8, label: 'Jun 2026' },
  { value: 9, label: 'Jul 2026' },
  { value: 10, label: 'Aug 2026' },
  { value: 11, label: 'Sep 2026' }
]

// API base URL - will be determined dynamically
const getApiBaseUrl = () => {
  // In development, use localhost:5000
  // In production, use the same domain
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000'
  }
  return '' // Use relative URLs in production
}

export const CloudBrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const apiBaseUrl = getApiBaseUrl()

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`${apiBaseUrl}/api/brands`)
      const data = await response.json()
      
      if (data.success) {
        setBrands(data.brands)
        setLastSync(new Date())
      } else {
        throw new Error(data.error || 'Failed to fetch brands')
      }
    } catch (err) {
      console.error('Error fetching brands:', err)
      setError(err.message)
      
      // Fallback to localStorage if API fails
      const localBrands = localStorage.getItem('zid_brands')
      if (localBrands) {
        try {
          setBrands(JSON.parse(localBrands))
        } catch (parseErr) {
          console.error('Error parsing local brands:', parseErr)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add new brand
  const addBrand = async (brandData) => {
    try {
      setError(null)
      
      const response = await fetch(`${apiBaseUrl}/api/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBrands(prev => [...prev, data.brand])
        setLastSync(new Date())
        
        // Update localStorage as backup
        const updatedBrands = [...brands, data.brand]
        localStorage.setItem('zid_brands', JSON.stringify(updatedBrands))
        
        return data.brand
      } else {
        throw new Error(data.error || 'Failed to add brand')
      }
    } catch (err) {
      console.error('Error adding brand:', err)
      setError(err.message)
      throw err
    }
  }

  // Update existing brand
  const updateBrand = async (brandId, brandData) => {
    try {
      setError(null)
      
      const response = await fetch(`${apiBaseUrl}/api/brands?id=${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBrands(prev => prev.map(brand => 
          brand.id === brandId ? data.brand : brand
        ))
        setLastSync(new Date())
        
        // Update localStorage as backup
        const updatedBrands = brands.map(brand => 
          brand.id === brandId ? data.brand : brand
        )
        localStorage.setItem('zid_brands', JSON.stringify(updatedBrands))
        
        return data.brand
      } else {
        throw new Error(data.error || 'Failed to update brand')
      }
    } catch (err) {
      console.error('Error updating brand:', err)
      setError(err.message)
      throw err
    }
  }

  // Delete brand
  const deleteBrand = async (brandId) => {
    try {
      setError(null)
      
      const response = await fetch(`${apiBaseUrl}/api/brands?id=${brandId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBrands(prev => prev.filter(brand => brand.id !== brandId))
        setLastSync(new Date())
        
        // Update localStorage as backup
        const updatedBrands = brands.filter(brand => brand.id !== brandId)
        localStorage.setItem('zid_brands', JSON.stringify(updatedBrands))
        
        return true
      } else {
        throw new Error(data.error || 'Failed to delete brand')
      }
    } catch (err) {
      console.error('Error deleting brand:', err)
      setError(err.message)
      throw err
    }
  }

  // Reset brands to default
  const resetBrands = async () => {
    try {
      setError(null)
      
      const response = await fetch(`${apiBaseUrl}/api/reset`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBrands(data.brands)
        setLastSync(new Date())
        
        // Update localStorage as backup
        localStorage.setItem('zid_brands', JSON.stringify(data.brands))
        
        return data.brands
      } else {
        throw new Error(data.error || 'Failed to reset brands')
      }
    } catch (err) {
      console.error('Error resetting brands:', err)
      setError(err.message)
      throw err
    }
  }

  // Sync with server (manual refresh)
  const syncBrands = async () => {
    await fetchBrands()
  }

  // Initial load
  useEffect(() => {
    fetchBrands()
  }, [])

  // Auto-sync every 30 seconds if there are other users
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchBrands()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isLoading])

  const value = {
    brands,
    isLoading,
    error,
    lastSync,
    addBrand,
    updateBrand,
    deleteBrand,
    resetBrands,
    syncBrands,
    apiBaseUrl
  }

  return (
    <CloudBrandContext.Provider value={value}>
      {children}
    </CloudBrandContext.Provider>
  )
}

export const useCloudBrands = () => {
  const context = useContext(CloudBrandContext)
  if (!context) {
    throw new Error('useCloudBrands must be used within a CloudBrandProvider')
  }
  return context
}

