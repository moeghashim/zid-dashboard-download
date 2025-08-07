// Vercel Serverless Function for brand data management
const { kv } = require('@vercel/kv')

const BRANDS_KEY = 'zid-brands'
const DEFAULT_BRANDS = [
  { id: 1, name: 'Crush', category: 'Premium Food', startingSales: 60000, monthlyGrowthRate: 15.5, startingMonth: 0 },
  { id: 2, name: 'Milaf', category: 'Traditional Goods', startingSales: 10000, monthlyGrowthRate: 8.2, startingMonth: 0 },
  { id: 3, name: 'Bab Sharqi', category: 'Traditional Goods', startingSales: 10000, monthlyGrowthRate: 3.1, startingMonth: 0 },
  { id: 4, name: 'Nuricle', category: 'Health & Beauty', startingSales: 10000, monthlyGrowthRate: 6.8, startingMonth: 0 },
  { id: 5, name: 'Reeq Al Nahl', category: 'Premium Food', startingSales: 5000, monthlyGrowthRate: 12.3, startingMonth: 0 },
  { id: 6, name: 'Leen Dates', category: 'Premium Food', startingSales: 20000, monthlyGrowthRate: 5.5, startingMonth: 0 }
]

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  try {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    switch (req.method) {
      case 'GET':
        return await getBrands(req, res)
      case 'POST':
        return await createBrand(req, res)
      case 'PUT':
        return await updateBrand(req, res)
      case 'DELETE':
        return await deleteBrand(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Get all brands
async function getBrands(req, res) {
  try {
    let brands = await kv.get(BRANDS_KEY)
    
    // Initialize with default brands if none exist
    if (!brands) {
      brands = DEFAULT_BRANDS
      await kv.set(BRANDS_KEY, brands)
    }
    
    return res.status(200).json({ success: true, brands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return res.status(500).json({ error: 'Failed to fetch brands' })
  }
}

// Create new brand
async function createBrand(req, res) {
  try {
    const { name, category, startingSales, monthlyGrowthRate, startingMonth } = req.body
    
    // Validation
    if (!name || !category || typeof startingSales !== 'number' || typeof monthlyGrowthRate !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const brands = await kv.get(BRANDS_KEY) || []
    
    const newBrand = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim(),
      startingSales: parseFloat(startingSales),
      monthlyGrowthRate: parseFloat(monthlyGrowthRate),
      startingMonth: parseInt(startingMonth) || 0
    }
    
    brands.push(newBrand)
    await kv.set(BRANDS_KEY, brands)
    
    return res.status(201).json({ success: true, brand: newBrand })
  } catch (error) {
    console.error('Error creating brand:', error)
    return res.status(500).json({ error: 'Failed to create brand' })
  }
}

// Update existing brand
async function updateBrand(req, res) {
  try {
    const { id } = req.query
    const { name, category, startingSales, monthlyGrowthRate, startingMonth } = req.body
    
    if (!id) {
      return res.status(400).json({ error: 'Brand ID required' })
    }
    
    const brands = await kv.get(BRANDS_KEY) || []
    const brandIndex = brands.findIndex(b => b.id === parseInt(id))
    
    if (brandIndex === -1) {
      return res.status(404).json({ error: 'Brand not found' })
    }
    
    // Update brand
    brands[brandIndex] = {
      ...brands[brandIndex],
      name: name?.trim() || brands[brandIndex].name,
      category: category?.trim() || brands[brandIndex].category,
      startingSales: startingSales !== undefined ? parseFloat(startingSales) : brands[brandIndex].startingSales,
      monthlyGrowthRate: monthlyGrowthRate !== undefined ? parseFloat(monthlyGrowthRate) : brands[brandIndex].monthlyGrowthRate,
      startingMonth: startingMonth !== undefined ? parseInt(startingMonth) : brands[brandIndex].startingMonth
    }
    
    await kv.set(BRANDS_KEY, brands)
    
    return res.status(200).json({ success: true, brand: brands[brandIndex] })
  } catch (error) {
    console.error('Error updating brand:', error)
    return res.status(500).json({ error: 'Failed to update brand' })
  }
}

// Delete brand
async function deleteBrand(req, res) {
  try {
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({ error: 'Brand ID required' })
    }
    
    const brands = await kv.get(BRANDS_KEY) || []
    const filteredBrands = brands.filter(b => b.id !== parseInt(id))
    
    if (filteredBrands.length === brands.length) {
      return res.status(404).json({ error: 'Brand not found' })
    }
    
    await kv.set(BRANDS_KEY, filteredBrands)
    
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return res.status(500).json({ error: 'Failed to delete brand' })
  }
}