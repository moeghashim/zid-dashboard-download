import React, { createContext, useContext, useState, useEffect } from 'react'

const ApiContext = createContext()

// Custom hook to use API context
export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

// Get API base URL based on environment
const getApiBaseUrl = () => {
  // In development, use local dev server API
  if (process.env.NODE_ENV === 'development') {
    return ''  // Use relative URLs for Vite proxy
  }
  // In production, use current domain
  return ''  // Vercel handles this automatically
}

// API provider component
export const ApiProvider = ({ children }) => {
  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
      } else {
        throw new Error(data.error || 'Failed to fetch brands')
      }
    } catch (err) {
      console.error('Error fetching brands:', err)
      setError(err.message)
      
      // Fallback to localStorage if API fails
      const localBrands = localStorage.getItem('zid-global-brands')
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
        
        // Update localStorage as backup
        const updatedBrands = [...brands, data.brand]
        localStorage.setItem('zid-global-brands', JSON.stringify(updatedBrands))
        
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
        
        // Update localStorage as backup
        const updatedBrands = brands.map(brand => 
          brand.id === brandId ? data.brand : brand
        )
        localStorage.setItem('zid-global-brands', JSON.stringify(updatedBrands))
        
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
      
      console.log('Deleting brand with ID:', brandId)
      console.log('API URL:', `${apiBaseUrl}/api/brands?id=${brandId}`)
      
      const response = await fetch(`${apiBaseUrl}/api/brands?id=${brandId}`, {
        method: 'DELETE'
      })
      
      console.log('Delete response status:', response.status)
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Delete response data:', data)
      
      if (data.success) {
        setBrands(prev => prev.filter(brand => brand.id !== brandId))
        
        // Update localStorage as backup
        const updatedBrands = brands.filter(brand => brand.id !== brandId)
        localStorage.setItem('zid-global-brands', JSON.stringify(updatedBrands))
        
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
        
        // Update localStorage as backup
        localStorage.setItem('zid-global-brands', JSON.stringify(data.brands))
        
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

  // Get brand by ID
  const getBrandById = (brandId) => {
    return brands.find(brand => brand.id === brandId)
  }

  // Get brands by category
  const getBrandsByCategory = (category) => {
    return brands.filter(brand => brand.category === category)
  }

  // Get all unique categories
  const getCategories = () => {
    return [...new Set(brands.map(brand => brand.category))]
  }

  // Export brands data to JSON file (same as before)
  const exportBrandsData = () => {
    const dataToExport = {
      brands: brands,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `zid-brands-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Import brands data from JSON file (uploads to API)
  const importBrandsData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          // Validate data structure
          if (data && data.brands && Array.isArray(data.brands)) {
            // Validate each brand has required fields
            const validBrands = data.brands.filter(brand => 
              brand.name && 
              brand.category && 
              typeof brand.startingSales === 'number' &&
              typeof brand.monthlyGrowthRate === 'number'
            )
            
            if (validBrands.length > 0) {
              // Clear current brands and add imported ones
              setBrands([])
              
              // Add each brand via API
              let importedCount = 0
              for (const brandData of validBrands) {
                try {
                  await addBrand(brandData)
                  importedCount++
                } catch (err) {
                  console.error('Failed to import brand:', brandData.name, err)
                }
              }
              
              resolve({ success: true, imported: importedCount })
            } else {
              reject(new Error('No valid brand data found in file'))
            }
          } else {
            reject(new Error('Invalid file format'))
          }
        } catch (error) {
          reject(new Error('Failed to parse JSON file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Initial load
  useEffect(() => {
    fetchBrands()
  }, [])

  const value = {
    brands,
    isLoading,
    error,
    addBrand,
    updateBrand,
    deleteBrand,
    resetBrands,
    getBrandById,
    getBrandsByCategory,
    getCategories,
    exportBrandsData,
    importBrandsData,
    refetch: fetchBrands
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}

export default ApiContext