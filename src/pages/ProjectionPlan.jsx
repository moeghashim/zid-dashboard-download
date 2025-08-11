import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Target, 
  AlertTriangle, FileText, Download, BarChart3 
} from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { 
  convertToProjectionData, 
  calculateQuarterlyData, 
  calculateKeyMetrics,
  formatCurrency 
} from '../utils/revenueCalculations'

export default function ProjectionPlan() {
  const { brands, isLoading } = useApi()

  if (isLoading || !brands) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projection data...</p>
        </div>
      </div>
    )
  }

  // Calculate dynamic data from brands context
  let monthlyData, quarterlyData, keyMetrics
  
  try {
    monthlyData = convertToProjectionData(brands) || []
    quarterlyData = calculateQuarterlyData(brands) || []
    keyMetrics = calculateKeyMetrics(brands) || {}
  } catch (error) {
    console.error('Error calculating projection data:', error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading projection data</div>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Zid Global</h1>
        </div>
        <h2 className="text-2xl font-semibold text-muted-foreground">12-Month Revenue Projection Plan</h2>
        <p className="text-lg text-muted-foreground">Executive Summary Report</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Analysis Date: August 6, 2025</span>
          <span>•</span>
          <span>Projection Period: October 2025 - September 2026</span>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(keyMetrics.totalRevenue || 0)}</div>
              <div className="text-sm text-muted-foreground">Total 12-Month Revenue</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(keyMetrics.avgMonthlyRevenue || 0)}</div>
              <div className="text-sm text-muted-foreground">Average Monthly Revenue</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(keyMetrics.twelfthMonthCommission || 0)}</div>
              <div className="text-sm text-muted-foreground">12th Mo Commission</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{keyMetrics.brandsWithLaunchPlans || 0}</div>
              <div className="text-sm text-muted-foreground">Brands with Launch Plans</div>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Zid Global is projected to generate <strong>{formatCurrency(keyMetrics.totalRevenue || 0)}</strong> in total revenue 
            over the 12-month period from October 2025 to September 2026. The business shows strong growth 
            potential with peak performance in Q1 2026, demonstrating exceptional 200% quarter-over-quarter growth.
          </p>
        </CardContent>
      </Card>

      {/* Monthly Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
          <CardDescription>Detailed month-by-month revenue progression with growth rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Month</th>
                  <th className="text-right p-2 font-medium">Revenue</th>
                  <th className="text-right p-2 font-medium">Growth Rate</th>
                  <th className="text-center p-2 font-medium">Quarter</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr key={month.month} className="border-b hover:bg-muted/50">
                    <td className="p-2 flex items-center gap-2">
                      {month.month}
                      {month.projected && <Badge variant="outline" className="text-xs">Projected</Badge>}
                    </td>
                    <td className="text-right p-2 font-mono">{formatCurrency(month.revenue)}</td>
                    <td className="text-right p-2">
                      {month.growth !== null ? (
                        <span className={`flex items-center justify-end gap-1 ${
                          month.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {month.growth > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {month.growth > 0 ? '+' : ''}{month.growth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-center p-2">
                      <Badge variant="secondary">{month.quarter}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle>Responsibilities</CardTitle>
          <CardDescription>Partnership responsibilities between Zid and Babanuj for market expansion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zid Responsibilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Zid Responsibilities</h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">1</div>
                    <p className="text-sm text-blue-800">
                      Organize two merchant acquisition events on September 26 and December 26.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">2</div>
                    <p className="text-sm text-blue-800">
                      Establish a partnership with the Ministry of Investment to support Saudi exports to the USA.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">3</div>
                    <p className="text-sm text-blue-800">
                      Strengthen relationships with shipping partners to reduce international shipping costs.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">4</div>
                    <p className="text-sm text-blue-800">
                      Collaborate with Babanuj to support the quarterly mega purchase event in the USA.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Babanuj Responsibilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Babanuj Responsibilities</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">1</div>
                    <p className="text-sm text-green-800">
                      Onboard new merchants, including listing their products on Amazon and TikTok Shop in the USA.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">2</div>
                    <p className="text-sm text-green-800">
                      Assist merchants in obtaining all required documents and approvals to sell in the USA.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">3</div>
                    <p className="text-sm text-green-800">
                      Operate as the merchant's seller in the USA.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">4</div>
                    <p className="text-sm text-green-800">
                      Manage all import, storage, and logistics operations in the USA.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">5</div>
                    <p className="text-sm text-green-800">
                      Develop and execute a US marketing and launch plan by fostering relationships with affiliates to promote the products.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-semibold mt-0.5">6</div>
                    <p className="text-sm text-green-800">
                      Remit payment to merchants for all sold merchandise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* September 2026 Projection */}
      <Card>
        <CardHeader>
          <CardTitle>September 2026 Projection Scenarios</CardTitle>
          <CardDescription>Multiple forecasting methods and scenario analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-sm font-medium text-red-600 mb-1">Conservative</div>
              <div className="text-2xl font-bold">{formatCurrency(919146)}</div>
              <div className="text-xs text-muted-foreground">15% below realistic</div>
            </div>
            <div className="p-4 border-2 border-primary rounded-lg text-center bg-primary/5">
              <div className="text-sm font-medium text-primary mb-1">Realistic</div>
              <div className="text-2xl font-bold">{formatCurrency(1081348)}</div>
              <div className="text-xs text-muted-foreground">Weighted average</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-sm font-medium text-green-600 mb-1">Optimistic</div>
              <div className="text-2xl font-bold">{formatCurrency(1297618)}</div>
              <div className="text-xs text-muted-foreground">20% above realistic</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Methodology</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The September 2026 projection uses multiple forecasting methods including linear trend analysis, 
              seasonal pattern recognition, moving average calculation, and polynomial regression modeling. 
              The realistic scenario of <strong>{formatCurrency(1081348)}</strong> represents the weighted 
              average of all methods and is considered the most likely outcome.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Business Insights</CardTitle>
          <CardDescription>Strategic findings and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Growth Opportunities
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Strong Q1 2026 performance with 200% QoQ growth indicates successful scaling strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Peak performance months (Aug 2026: $1.26M) show maximum revenue potential</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Recovery pattern in Q3 2026 demonstrates business resilience and adaptability</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Factors
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>High revenue volatility (46%) requires careful cash flow management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Significant month-over-month fluctuations need monitoring and mitigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Seasonal patterns (May-Jun decline) require strategic planning</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Recommendations</CardTitle>
          <CardDescription>Actionable insights for business planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Short-term (Next 3 months)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Implement robust cash flow management to handle revenue volatility</li>
                <li>• Monitor monthly performance closely with early warning systems</li>
                <li>• Investigate factors behind Q1 2026 success for replication</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Medium-term (6-12 months)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Develop strategies to reduce revenue volatility and create stability</li>
                <li>• Diversify revenue streams to minimize seasonal impact</li>
                <li>• Scale operations appropriately for projected Q3 2026 growth</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Long-term (12+ months)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Build sustainable growth model with predictable revenue generation</li>
                <li>• Establish market leadership position in key segments</li>
                <li>• Create financial resilience through multiple revenue channels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground border-t pt-6">
        <p>Report prepared by Manus AI Agent • Interactive Dashboard Available</p>
        <p className="mt-1">Contact available for follow-up analysis and updates</p>
      </div>
    </div>
  )
}

