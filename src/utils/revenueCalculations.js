// Revenue calculation utilities with starting month support

export const MONTHS = [
  "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026",
  "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"
]

/**
 * Calculate monthly performance for a single brand with starting month support
 * @param {Object} brand - Brand object with startingSales, monthlyGrowthRate, startingMonth, hasLaunchPlan, launchPlanFee
 * @returns {Array} Array of monthly performance data
 */
export function calculateBrandPerformance(brand) {
  const { startingSales, monthlyGrowthRate, startingMonth = 0, hasLaunchPlan = false, launchPlanFee = 0 } = brand
  const growthRate = monthlyGrowthRate / 100
  
  return MONTHS.map((month, index) => {
    let revenue = 0
    let launchPlanRevenue = 0
    
    // Only calculate revenue if we've reached the starting month
    if (index >= startingMonth) {
      // Calculate months since starting month
      const monthsSinceStart = index - startingMonth
      revenue = startingSales * Math.pow(1 + growthRate, monthsSinceStart)
      
      // Add launch plan fee only in the starting month (one-time fee)
      if (hasLaunchPlan && index === startingMonth) {
        launchPlanRevenue = launchPlanFee || 0
      }
    }
    
    const totalRevenue = revenue + launchPlanRevenue
    
    return {
      month,
      revenue: totalRevenue, // Total revenue including launch plan
      recurringRevenue: revenue, // Just the recurring revenue
      launchPlanRevenue, // Launch plan revenue for this month
      monthIndex: index,
      isActive: index >= startingMonth,
      brand: brand.name,
      category: brand.category,
      sales: Math.round(totalRevenue) // For backward compatibility
    }
  })
}

/**
 * Calculate aggregated monthly data across all brands
 * @param {Array} brands - Array of brand objects
 * @returns {Array} Array of monthly totals
 */
export function calculateAggregatedData(brands) {
  if (!brands || brands.length === 0) {
    return MONTHS.map((month, index) => ({
      month,
      revenue: 0,
      total: 0, // For backward compatibility
      monthIndex: index
    }))
  }
  
  // Calculate performance for each brand
  const brandPerformances = {}
  brands.forEach(brand => {
    brandPerformances[brand.name] = calculateBrandPerformance(brand)
  })
  
  // Aggregate by month
  const monthlyTotals = MONTHS.map((month, index) => {
    const totalRevenue = brands.reduce((sum, brand) => {
      const brandPerf = brandPerformances[brand.name]
      return sum + (brandPerf[index]?.revenue || 0)
    }, 0)
    
    return {
      month,
      revenue: totalRevenue,
      total: totalRevenue, // For backward compatibility
      monthIndex: index
    }
  })
  
  return { monthlyTotals, brandPerformances }
}

/**
 * Calculate launch plan metrics from brands data
 * @param {Array} brands - Array of brand objects
 * @returns {Object} Launch plan metrics object
 */
export function calculateLaunchPlanMetrics(brands) {
  if (!brands || brands.length === 0) {
    return {
      totalLaunchPlanRevenue: 0,
      zidLaunchPlanCommission: 0,
      launchPlanCommissionRate: 30,
      brandsWithLaunchPlans: 0
    }
  }

  const totalLaunchPlanRevenue = brands.reduce((sum, brand) => {
    return sum + (brand.hasLaunchPlan ? (brand.launchPlanFee || 0) : 0)
  }, 0)

  const zidLaunchPlanCommission = totalLaunchPlanRevenue * 0.30 // 30% commission
  const brandsWithLaunchPlans = brands.filter(brand => brand.hasLaunchPlan).length

  return {
    totalLaunchPlanRevenue,
    zidLaunchPlanCommission,
    launchPlanCommissionRate: 30,
    brandsWithLaunchPlans
  }
}

/**
 * Calculate key metrics from brands data including launch plans
 * @param {Array} brands - Array of brand objects
 * @returns {Object} Key metrics object
 */
export function calculateKeyMetrics(brands) {
  if (!brands || brands.length === 0) {
    return {
      totalRevenue: 0,
      totalRecurringRevenue: 0,
      totalLaunchPlanRevenue: 0,
      zidLaunchPlanCommission: 0,
      averageMonthlyRevenue: 0,
      avgMonthlyRevenue: 0, // For backward compatibility
      peakMonthRevenue: 0,
      peakMonth: 'N/A',
      peakRevenue: 0, // For backward compatibility
      brandsWithLaunchPlans: 0
    }
  }
  
  const { monthlyTotals } = calculateAggregatedData(brands)
  const revenues = monthlyTotals.map(data => data.revenue)
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue, 0)
  const averageMonthlyRevenue = totalRevenue / revenues.length
  
  // Calculate launch plan metrics
  const launchPlanMetrics = calculateLaunchPlanMetrics(brands)
  
  // Calculate total recurring revenue (without launch plan fees)
  const totalRecurringRevenue = totalRevenue - launchPlanMetrics.totalLaunchPlanRevenue
  
  // Find peak month
  const maxRevenue = Math.max(...revenues)
  const peakMonthIndex = revenues.indexOf(maxRevenue)
  const peakMonth = monthlyTotals[peakMonthIndex]?.month || 'N/A'
  
  
  return {
    totalRevenue,
    totalRecurringRevenue,
    totalLaunchPlanRevenue: launchPlanMetrics.totalLaunchPlanRevenue,
    zidLaunchPlanCommission: launchPlanMetrics.zidLaunchPlanCommission,
    averageMonthlyRevenue,
    avgMonthlyRevenue: averageMonthlyRevenue, // For backward compatibility
    peakMonthRevenue: maxRevenue,
    peakMonth,
    peakRevenue: maxRevenue, // For backward compatibility
    brandsWithLaunchPlans: launchPlanMetrics.brandsWithLaunchPlans
  }
}

/**
 * Convert aggregated data to format compatible with Dashboard charts
 * @param {Array} brands - Array of brand objects
 * @returns {Array} Chart-compatible data
 */
export function convertToProjectionData(brands) {
  if (!brands || brands.length === 0) {
    return []
  }
  
  const aggregatedResult = calculateAggregatedData(brands)
  const monthlyTotals = aggregatedResult.monthlyTotals || aggregatedResult
  
  if (!Array.isArray(monthlyTotals)) {
    console.error('monthlyTotals is not an array:', monthlyTotals)
    return []
  }
  
  return monthlyTotals.map((data, index) => {
    // Calculate month-over-month growth
    let growth = null
    if (index > 0 && monthlyTotals[index - 1]?.revenue > 0) {
      const prevRevenue = monthlyTotals[index - 1].revenue
      growth = ((data.revenue - prevRevenue) / prevRevenue) * 100
    }
    
    return {
      month: data.month,
      revenue: Math.round(data.revenue),
      quarter: getQuarter(index),
      monthNum: index + 1,
      projected: index === 11, // Mark September 2026 as projected
      monthIndex: data.monthIndex,
      growth: growth
    }
  })
}

/**
 * Calculate quarterly data with growth rates
 * @param {Array} brands - Array of brand objects
 * @returns {Array} Quarterly data with growth rates
 */
export function calculateQuarterlyData(brands) {
  const projectionData = convertToProjectionData(brands)
  
  const quarters = {
    'Q4 2025': { revenue: 0, months: [] },
    'Q1 2026': { revenue: 0, months: [] },
    'Q2 2026': { revenue: 0, months: [] },
    'Q3 2026': { revenue: 0, months: [] }
  }
  
  projectionData.forEach(month => {
    quarters[month.quarter].revenue += month.revenue
    quarters[month.quarter].months.push(month.revenue)
  })
  
  const quarterlyData = []
  let previousRevenue = 0
  
  Object.entries(quarters).forEach(([quarter, data]) => {
    const growth = previousRevenue > 0 ? ((data.revenue - previousRevenue) / previousRevenue) * 100 : 0
    quarterlyData.push({
      quarter,
      revenue: data.revenue,
      growth: Math.round(growth * 10) / 10,
      growthRate: growth // For consistency
    })
    previousRevenue = data.revenue
  })
  
  return quarterlyData
}

/**
 * Format currency values
 * @param {number} value - Numeric value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '$0'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Calculate brand contribution percentages
 * @param {Array} brands - Array of brand objects
 * @returns {Array} Brands with contribution percentages
 */
export function calculateBrandContributions(brands) {
  if (!brands || brands.length === 0) return []
  
  // Calculate total revenue for each brand
  const brandsWithRevenue = brands.map(brand => {
    const performance = calculateBrandPerformance(brand)
    const totalRevenue = performance.reduce((sum, month) => sum + month.revenue, 0)
    return {
      ...brand,
      totalRevenue
    }
  })
  
  // Calculate total across all brands
  const grandTotal = brandsWithRevenue.reduce((sum, brand) => sum + brand.totalRevenue, 0)
  
  // Add contribution percentages
  return brandsWithRevenue.map(brand => ({
    ...brand,
    contributionPercentage: grandTotal > 0 ? (brand.totalRevenue / grandTotal) * 100 : 0
  }))
}

/**
 * Get month label by index
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month label
 */
export function getMonthLabel(monthIndex) {
  return MONTHS[monthIndex] || 'Unknown'
}

/**
 * Calculate revenue for a specific brand and month
 * @param {Object} brand - Brand object
 * @param {number} monthIndex - Month index (0-11)
 * @returns {number} Revenue for that month
 */
export function calculateBrandMonthRevenue(brand, monthIndex) {
  const { startingSales, monthlyGrowthRate, startingMonth = 0 } = brand
  
  // Return 0 if before starting month
  if (monthIndex < startingMonth) {
    return 0
  }
  
  const growthRate = monthlyGrowthRate / 100
  const monthsSinceStart = monthIndex - startingMonth
  
  return startingSales * Math.pow(1 + growthRate, monthsSinceStart)
}

// Helper function to determine quarter
function getQuarter(monthIndex) {
  if (monthIndex < 3) return 'Q4 2025'
  if (monthIndex < 6) return 'Q1 2026'
  if (monthIndex < 9) return 'Q2 2026'
  return 'Q3 2026'
}

// Legacy exports for backward compatibility
export const months = MONTHS
export const defaultBrands = [
  { id: 1, name: 'Crush', category: 'Premium Food', startingSales: 60000, monthlyGrowthRate: 15.5, startingMonth: 0 },
  { id: 2, name: 'Milaf', category: 'Traditional Goods', startingSales: 10000, monthlyGrowthRate: 8.2, startingMonth: 0 },
  { id: 3, name: 'Bab Sharqi', category: 'Traditional Goods', startingSales: 10000, monthlyGrowthRate: 3.1, startingMonth: 0 },
  { id: 4, name: 'Nuricle', category: 'Health & Beauty', startingSales: 10000, monthlyGrowthRate: 6.8, startingMonth: 0 },
  { id: 5, name: 'Reeq Al Nahl', category: 'Premium Food', startingSales: 5000, monthlyGrowthRate: 12.3, startingMonth: 0 },
  { id: 6, name: 'Leen Dates', category: 'Premium Food', startingSales: 20000, monthlyGrowthRate: 5.5, startingMonth: 0 }
]

export const categoryColors = {
  'Premium Food': '#3b82f6',
  'Traditional Goods': '#10b981',
  'Health & Beauty': '#f59e0b',
  'Electronics': '#ef4444',
  'Fashion': '#8b5cf6',
  'Home & Garden': '#06b6d4',
  'Sports': '#84cc16',
  'Books': '#f97316'
}

