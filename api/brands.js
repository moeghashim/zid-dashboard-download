// Vercel Serverless Function for brand data management with Supabase
import { createClient } from '@supabase/supabase-js'
import { BrandCreateSchema, BrandUpdateSchema, toDb, fromDb } from '../src/schemas/brand.js'

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
let defaultBrands = [
  {
    id: 1,
    name: "Tech Innovators",
    category: "Technology",
    startingSales: 45000,
    monthlyGrowthRate: 12,
    startingMonth: 0,
    hasLaunchPlan: true,
    launchPlanFee: 15000
  },
  {
    id: 2,
    name: "Fashion Forward",
    category: "Fashion",
    startingSales: 32000,
    monthlyGrowthRate: 8,
    startingMonth: 2,
    hasLaunchPlan: true,
    launchPlanFee: 8000
  },
  {
    id: 3,
    name: "Health & Wellness",
    category: "Health",
    startingSales: 28000,
    monthlyGrowthRate: 15,
    startingMonth: 1,
    hasLaunchPlan: false,
    launchPlanFee: 0
  }
]

// CORS headers (allow configure via env)
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
}

// Optional admin API key enforcement for mutations
const adminApiKey = process.env.ADMIN_API_KEY
function requireAdmin(req, res) {
  if (!adminApiKey) return true // no key set -> allow (development)
  const provided = req.headers['x-api-key']
  if (provided !== adminApiKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
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
        if (!requireAdmin(req, res)) return
        return await createBrand(req, res)
      case 'PUT':
        if (!requireAdmin(req, res)) return
        return await updateBrand(req, res)
      case 'DELETE':
        if (!requireAdmin(req, res)) return
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
    const transformedBrands = brands.map(fromDb)
    
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
    // Validate request body
    const parsed = BrandCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
    }
    const valid = parsed.data

    // Use default data if Supabase is not configured
    if (!supabase) {
      const newBrand = {
        id: Date.now(), // Simple ID generation for development
        ...valid,
      }
      
      // Add to in-memory array
      defaultBrands.push(newBrand)
      console.log('Added brand:', newBrand)
      
      return res.status(201).json({ success: true, brand: newBrand })
    }
    
    const { data: brand, error } = await supabase
      .from('brands')
      .insert([ toDb(valid) ])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to create brand', details: error.message })
    }
    
    // Transform data to match frontend expectations
    const transformedBrand = fromDb(brand)
    
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
    const parsed = BrandUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() })
    }
    const updates = parsed.data
    
    if (!id) {
      return res.status(400).json({ error: 'Brand ID required' })
    }

    // Use default data if Supabase is not configured
    if (!supabase) {
      const brandIndex = defaultBrands.findIndex(b => b.id === parseInt(id))
      if (brandIndex === -1) {
        return res.status(404).json({ error: 'Brand not found' })
      }
      
      const existingBrand = defaultBrands[brandIndex]
      const updatedBrand = { ...existingBrand, ...updates }
      
      // Update in-memory array
      defaultBrands[brandIndex] = updatedBrand
      console.log('Updated brand:', updatedBrand)
      
      return res.status(200).json({ success: true, brand: updatedBrand })
    }
    
    const updateData = {}
    if (updates.name !== undefined) updateData.name = updates.name.trim()
    if (updates.category !== undefined) updateData.category = updates.category.trim()
    if (updates.startingSales !== undefined) updateData.starting_sales = Number(updates.startingSales)
    if (updates.monthlyGrowthRate !== undefined) updateData.monthly_growth_rate = Number(updates.monthlyGrowthRate)
    if (updates.startingMonth !== undefined) updateData.starting_month = Number(updates.startingMonth)
    if (updates.hasLaunchPlan !== undefined) updateData.has_launch_plan = Boolean(updates.hasLaunchPlan)
    if (updates.launchPlanFee !== undefined) updateData.launch_plan_fee = Number(updates.launchPlanFee)
    
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
    const transformedBrand = fromDb(brand)
    
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

    // Use default data if Supabase is not configured
    if (!supabase) {
      const brandIndex = defaultBrands.findIndex(b => b.id === parseInt(id))
      if (brandIndex === -1) {
        return res.status(404).json({ error: 'Brand not found' })
      }
      
      // Remove from in-memory array
      const deletedBrand = defaultBrands.splice(brandIndex, 1)[0]
      console.log('Deleted brand:', deletedBrand)
      
      return res.status(200).json({ success: true })
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
