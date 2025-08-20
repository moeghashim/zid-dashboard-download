import { z } from 'zod'

// Shared brand schemas for validation and transformation
export const BrandBaseSchema = z.object({
  name: z.string().trim().min(1, 'name required').max(100),
  category: z.string().trim().min(1, 'category required').max(100),
  startingSales: z.coerce.number().min(0, 'startingSales must be >= 0'),
  monthlyGrowthRate: z.coerce.number().min(0).max(1000),
  startingMonth: z.coerce.number().int().min(0).max(11).default(0),
  hasLaunchPlan: z.coerce.boolean().optional().default(false),
  launchPlanFee: z.coerce.number().min(0).optional().default(0),
})

export const BrandCreateSchema = BrandBaseSchema
export const BrandUpdateSchema = BrandBaseSchema.partial()

// Transformations between API (frontend) shape and DB shape
export const toDb = (brand) => ({
  name: brand.name.trim(),
  category: brand.category.trim(),
  starting_sales: Number(brand.startingSales),
  monthly_growth_rate: Number(brand.monthlyGrowthRate),
  starting_month: Number(brand.startingMonth ?? 0),
  has_launch_plan: Boolean(brand.hasLaunchPlan ?? false),
  launch_plan_fee: Number(brand.launchPlanFee ?? 0),
})

export const fromDb = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  startingSales: parseFloat(row.starting_sales),
  monthlyGrowthRate: parseFloat(row.monthly_growth_rate),
  startingMonth: row.starting_month,
  hasLaunchPlan: Boolean(row.has_launch_plan || false),
  launchPlanFee: parseFloat(row.launch_plan_fee || 0),
})

