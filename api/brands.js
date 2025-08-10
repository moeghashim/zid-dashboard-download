// Vercel Serverless Function for brand data management with Supabase
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn('Missing Supabase environment variables, using default data for development')
}

// Default brands data for development when Supabase is not configured
const defaultBrands = [
  {
    id: 1,
    name: "Tech Innovators",
    category: "Technology",
    startingSales: 45000,
    monthlyGrowthRate: 12,
    startingMonth: 0
  },
  {
    id: 2,
    name: "Fashion Forward",
    category: "Fashion",
    startingSales: 32000,
    monthlyGrowthRate: 8,
    startingMonth: 2
  },
  {
    id: 3,
    name: "Health & Wellness",
    category: "Health",
    startingSales: 28000,
    monthlyGrowthRate: 15,
    startingMonth: 1
  }
]

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
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
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

// Get all brands
async function getBrands(req, res) {
  try {
    // Use default data if Supabase is not configured
    if (!supabase) {
      return res.status(200).json({ success: true, brands: defaultBrands })
    }

    const { data: brands, error } = await supabase
      .from('brands')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('Supabase error:', error)
      // Fallback to default data on database error
      return res.status(200).json({ success: true, brands: defaultBrands })
    }
    
    // Transform data to match frontend expectations
    const transformedBrands = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      category: brand.category,
      startingSales: parseFloat(brand.starting_sales),
      monthlyGrowthRate: parseFloat(brand.monthly_growth_rate),
      startingMonth: brand.starting_month
    }))
    
    return res.status(200).json({ success: true, brands: transformedBrands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    // Fallback to default data on any error
    return res.status(200).json({ success: true, brands: defaultBrands })
  }
}

// Create new brand
async function createBrand(req, res) {
  try {
    const { name, category, startingSales, monthlyGrowthRate, startingMonth } = req.body
    
    // Validation
    if (!name || !category || typeof startingSales !== 'number' || typeof monthlyGrowthRate !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid required fields' })
    }
    
    const { data: brand, error } = await supabase
      .from('brands')
      .insert([
        {
          name: name.trim(),
          category: category.trim(),
          starting_sales: parseFloat(startingSales),
          monthly_growth_rate: parseFloat(monthlyGrowthRate),
          starting_month: parseInt(startingMonth) || 0
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to create brand', details: error.message })
    }
    
    // Transform data to match frontend expectations
    const transformedBrand = {
      id: brand.id,
      name: brand.name,
      category: brand.category,
      startingSales: parseFloat(brand.starting_sales),
      monthlyGrowthRate: parseFloat(brand.monthly_growth_rate),
      startingMonth: brand.starting_month
    }
    
    return res.status(201).json({ success: true, brand: transformedBrand })
  } catch (error) {
    console.error('Error creating brand:', error)
    return res.status(500).json({ error: 'Failed to create brand', details: error.message })
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
    
    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (category !== undefined) updateData.category = category.trim()
    if (startingSales !== undefined) updateData.starting_sales = parseFloat(startingSales)
    if (monthlyGrowthRate !== undefined) updateData.monthly_growth_rate = parseFloat(monthlyGrowthRate)
    if (startingMonth !== undefined) updateData.starting_month = parseInt(startingMonth)
    
    const { data: brand, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Brand not found' })
      }
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to update brand', details: error.message })
    }
    
    // Transform data to match frontend expectations
    const transformedBrand = {
      id: brand.id,
      name: brand.name,
      category: brand.category,
      startingSales: parseFloat(brand.starting_sales),
      monthlyGrowthRate: parseFloat(brand.monthly_growth_rate),
      startingMonth: brand.starting_month
    }
    
    return res.status(200).json({ success: true, brand: transformedBrand })
  } catch (error) {
    console.error('Error updating brand:', error)
    return res.status(500).json({ error: 'Failed to update brand', details: error.message })
  }
}

// Delete brand
async function deleteBrand(req, res) {
  try {
    const { id } = req.query
    
    if (!id) {
      return res.status(400).json({ error: 'Brand ID required' })
    }
    
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', parseInt(id))
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to delete brand', details: error.message })
    }
    
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return res.status(500).json({ error: 'Failed to delete brand', details: error.message })
  }
}