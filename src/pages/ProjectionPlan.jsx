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


      {/* Business Model */}
      <Card>
        <CardHeader>
          <CardTitle>Business Model</CardTitle>
          <CardDescription>Revenue structure and partnership model between Zid and Babanuj</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Launch Package */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Launch Package</h3>
                  <p className="text-blue-700 text-sm">Complete merchant onboarding and marketing setup</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Package Fee:</span>
                    <span className="text-2xl font-bold text-blue-900">$10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Zid Commission:</span>
                    <span className="text-xl font-bold text-blue-900">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Babanuj Receives:</span>
                    <span className="text-xl font-bold text-blue-900">$7,000</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 text-sm">Package Includes:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Amazon marketplace setup and optimization</li>
                    <li>• TikTok Shop integration and listing</li>
                    <li>• Offline marketing materials and campaigns</li>
                    <li>• Product photography and content creation</li>
                    <li>• Initial advertising and promotion budget</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ongoing Commission Structure */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Percent className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">Ongoing Sales Commission</h3>
                  <p className="text-green-700 text-sm">Revenue sharing on all merchant sales</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-900 mb-1">5%</div>
                  <div className="text-sm font-medium text-green-800">Zid Commission</div>
                  <div className="text-xs text-green-600 mt-1">On all sales revenue</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-900 mb-1">95%</div>
                  <div className="text-sm font-medium text-green-800">Merchant Receives</div>
                  <div className="text-xs text-green-600 mt-1">After Zid commission</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-sm font-bold text-green-900 mb-1">Monthly</div>
                  <div className="text-sm font-medium text-green-800">Payment Cycle</div>
                  <div className="text-xs text-green-600 mt-1">Automated remittance</div>
                </div>
              </div>
            </div>

            {/* Model Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">For Merchants</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete US market access setup</li>
                  <li>• Professional marketing and launch support</li>
                  <li>• No upfront marketing costs beyond package</li>
                  <li>• 95% of ongoing sales revenue retained</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">For Zid</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• $3,000 upfront revenue per merchant</li>
                  <li>• 5% recurring commission on all sales</li>
                  <li>• Scalable revenue model</li>
                  <li>• Long-term merchant relationships</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Business Insights</CardTitle>
          <CardDescription>Strategic findings and market analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Growth Opportunities
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Strategic offline partnerships in The US</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Launching products across all available platforms: TikTok Shop, Amazon, Temu, Etsy..etc</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Logistics inside The US</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Benefit from Christmas Ramadan season</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Factors
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Slow acquisition</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Future tariffs increase</span>
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
                <li>• <strong>Marketing:</strong> Position Zid Global as the most cost-effective gateway to international markets, emphasizing logistics and marketing advantages.</li>
                <li>• Develop a targeted acquisition list for Christmas and Ramadan.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Medium-term (6–12 months)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Build a robust pipeline of merchants seeking global expansion.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Long-term (12+ months)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Conduct a Gulf tour to acquire prominent regional brands.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

