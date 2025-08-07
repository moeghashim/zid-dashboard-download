// Reset brands to default data
import { kv } from '@vercel/kv'

const BRANDS_KEY = 'zid-brands'
const DEFAULT_BRANDS = [
  { id: 1, name: 'Crush', category: 'Premium Food', startingSales: 60000, monthlyGrowthRate: 15.5, startingMonth: 0 },
  { id: 2, name: 'Milaf', category: 'Traditional Goods', startingSales: 10000, monthlyGrowthRate: 8.2, startingMonth: 0 },
  { id: 3, name: 'Bab Sharqi', category: 'Traditional Goods', startingSales: 10000, monthlyGrowthRate: 3.1, startingMonth: 0 },
  { id: 4, name: 'Nuricle', category: 'Health & Beauty', startingSales: 10000, monthlyGrowthRate: 6.8, startingMonth: 0 },
  { id: 5, name: 'Reeq Al Nahl', category: 'Premium Food', startingSales: 5000, monthlyGrowthRate: 12.3, startingMonth: 0 },
  { id: 6, name: 'Leen Dates', category: 'Premium Food', startingSales: 20000, monthlyGrowthRate: 5.5, startingMonth: 0 }
]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
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
    await kv.set(BRANDS_KEY, DEFAULT_BRANDS)
    return res.status(200).json({ success: true, brands: DEFAULT_BRANDS })
  } catch (error) {
    console.error('Error resetting brands:', error)
    return res.status(500).json({ error: 'Failed to reset brands' })
  }
}