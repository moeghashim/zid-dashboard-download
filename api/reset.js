// Reset brands to default data using Supabase
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DEFAULT_BRANDS = [
  { name: 'Crush', category: 'Premium Food', starting_sales: 60000.00, monthly_growth_rate: 15.50, starting_month: 0, has_launch_plan: true, launch_plan_fee: 10000 },
  { name: 'Milaf', category: 'Traditional Goods', starting_sales: 10000.00, monthly_growth_rate: 8.20, starting_month: 0, has_launch_plan: false, launch_plan_fee: 0 },
  { name: 'Bab Sharqi', category: 'Traditional Goods', starting_sales: 10000.00, monthly_growth_rate: 3.10, starting_month: 0, has_launch_plan: true, launch_plan_fee: 10000 },
  { name: 'Nuricle', category: 'Health & Beauty', starting_sales: 10000.00, monthly_growth_rate: 6.80, starting_month: 0, has_launch_plan: false, launch_plan_fee: 0 },
  { name: 'Reeq Al Nahl', category: 'Premium Food', starting_sales: 5000.00, monthly_growth_rate: 12.30, starting_month: 0, has_launch_plan: true, launch_plan_fee: 10000 },
  { name: 'Leen Dates', category: 'Premium Food', starting_sales: 20000.00, monthly_growth_rate: 5.50, starting_month: 0, has_launch_plan: false, launch_plan_fee: 0 },
  { name: 'Salam Coffee', category: 'Premium Food', starting_sales: 35000.00, monthly_growth_rate: 9.80, starting_month: 1, has_launch_plan: true, launch_plan_fee: 10000 },
  { name: 'Golden Spice', category: 'Traditional Goods', starting_sales: 8000.00, monthly_growth_rate: 7.50, starting_month: 2, has_launch_plan: false, launch_plan_fee: 0 },
  { name: 'Desert Rose Beauty', category: 'Health & Beauty', starting_sales: 15000.00, monthly_growth_rate: 11.20, starting_month: 1, has_launch_plan: true, launch_plan_fee: 10000 },
  { name: 'Heritage Crafts', category: 'Traditional Goods', starting_sales: 12000.00, monthly_growth_rate: 6.40, starting_month: 3, has_launch_plan: false, launch_plan_fee: 0 },
  { name: 'Pure Honey Co', category: 'Premium Food', starting_sales: 25000.00, monthly_growth_rate: 8.90, starting_month: 2, has_launch_plan: true, launch_plan_fee: 10000 },
  { name: 'Arabian Elegance', category: 'Fashion', starting_sales: 18000.00, monthly_growth_rate: 10.50, starting_month: 1, has_launch_plan: true, launch_plan_fee: 10000 }
]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    return res.status(200).json({ ok: true })
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Delete all existing brands
    const { error: deleteError } = await supabase
      .from('brands')
      .delete()
      .neq('id', 0) // Delete all records (id is never 0)

    if (deleteError) {
      console.error('Error deleting brands:', deleteError)
      return res.status(500).json({ error: 'Failed to reset brands', details: deleteError.message })
    }

    // Insert default brands
    const { data: brands, error: insertError } = await supabase
      .from('brands')
      .insert(DEFAULT_BRANDS)
      .select()

    if (insertError) {
      console.error('Error inserting default brands:', insertError)
      return res.status(500).json({ error: 'Failed to reset brands', details: insertError.message })
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
    console.error('Error resetting brands:', error)
    return res.status(500).json({ error: 'Failed to reset brands', details: error.message })
  }
}