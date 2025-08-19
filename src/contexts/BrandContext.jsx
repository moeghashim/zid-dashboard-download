import React, { createContext, useContext, useState, useEffect } from 'react'
import { defaultBrands } from '../utils/revenueCalculations'

const BrandContext = createContext()

// Custom hook to use brand context
export const useBrands = () => {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error('useBrands must be used within a BrandProvider')
  }
  return context
}

// Brand provider component
export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState(defaultBrands)
  const [isLoading, setIsLoading] = useState(true)

  // Load brands from localStorage on component mount
  useEffect(() => {
    try {
      const savedBrands = localStorage.getItem('zid-global-brands')
      if (savedBrands) {
        const parsedBrands = JSON.parse(savedBrands)
        // Validate the data structure
        if (Array.isArray(parsedBrands) && parsedBrands.length > 0) {
          setBrands(parsedBrands)
        }
      }
    } catch (error) {
      console.error('Error loading brands from localStorage:', error)
      // If there's an error, use default brands
      setBrands(defaultBrands)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save brands to localStorage whenever brands change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('zid-global-brands', JSON.stringify(brands))
      } catch (error) {
        console.error('Error saving brands to localStorage:', error)
      }
    }
  }, [brands, isLoading])

  // Brand management functions
  const addBrand = (brandData) => {
    const newBrand = {
      id: Date.now(),
      name: brandData.name,
      category: brandData.category,
      startingSales: parseFloat(brandData.startingSales),
      monthlyGrowthRate: parseFloat(brandData.monthlyGrowthRate),
      startingMonth: brandData.startingMonth || 0
    }
    setBrands(prevBrands => [...prevBrands, newBrand])
    return newBrand
  }

  const updateBrand = (brandId, updatedData) => {
    setBrands(prevBrands => 
      prevBrands.map(brand => 
        brand.id === brandId 
          ? {
              ...brand,
              name: updatedData.name,
              category: updatedData.category,
              startingSales: parseFloat(updatedData.startingSales),
              monthlyGrowthRate: parseFloat(updatedData.monthlyGrowthRate),
              startingMonth: updatedData.startingMonth || brand.startingMonth || 0
            }
          : brand
      )
    )
  }

  const deleteBrand = (brandId) => {
    setBrands(prevBrands => prevBrands.filter(brand => brand.id !== brandId))
  }

  const resetBrands = () => {
    setBrands(defaultBrands)
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

  // Export brands data to JSON file
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

  // Import brands data from JSON file
  const importBrandsData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          // Validate data structure
          if (data && data.brands && Array.isArray(data.brands)) {
            // Validate each brand has required fields
            const validBrands = data.brands.filter(brand => 
              brand.id && 
              brand.name && 
              brand.category && 
              typeof brand.startingSales === 'number' &&
              typeof brand.monthlyGrowthRate === 'number'
            )
            
            if (validBrands.length > 0) {
              setBrands(validBrands)
              resolve({ success: true, imported: validBrands.length })
            } else {
              reject(new Error('No valid brand data found in file'))
            }
          } else {
            reject(new Error('Invalid file format'))
          }
        } catch {
          reject(new Error('Failed to parse JSON file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const contextValue = {
    brands,
    isLoading,
    addBrand,
    updateBrand,
    deleteBrand,
    resetBrands,
    getBrandById,
    getBrandsByCategory,
    getCategories,
    exportBrandsData,
    importBrandsData
  }

  return (
    <BrandContext.Provider value={contextValue}>
      {children}
    </BrandContext.Provider>
  )
}

export default BrandContext

