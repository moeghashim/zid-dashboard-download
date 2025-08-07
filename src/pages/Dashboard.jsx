import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Target, 
  BarChart3, PieChart as PieChartIcon, Activity, AlertTriangle, Percent 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../contexts/ApiContext'
import { 
  calculateKeyMetrics, 
  convertToProjectionData, 
  calculateQuarterlyData,
  formatCurrency 
} from '../utils/revenueCalculations'

// Scenario data for September 2026 projections
const scenarioData = [
  { scenario: 'Conservative', value: 919146, color: '#ef4444' },
  { scenario: 'Realistic', value: 1081348, color: '#3b82f6' },
  { scenario: 'Optimistic', value: 1297618, color: '#10b981' }
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [commissionRate, setCommissionRate] = useState(5)
  const [animationKey, setAnimationKey] = useState(0)
  const { isAdmin } = useAuth()
  const { brands, isLoading: brandsLoading } = useApi()
  
  // Calculate dynamic data based on current brands from context
  const keyMetrics = calculateKeyMetrics(brands)
  const projectionData = convertToProjectionData(brands)
  const quarterlyData = calculateQuarterlyData(brands)

  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [activeTab, brands]) // Update animation when brands change

  // Show loading state while brands are loading
  if (brandsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading brand data...</p>
        </div>
      </div>
    )
  }


  // Commission calculations
  const totalCommission = (keyMetrics.totalRevenue * commissionRate) / 100
  const avgMonthlyCommission = totalCommission / 12
  const peakCommissionMonth = projectionData.reduce((max, month) => 
    month.revenue > max.revenue ? month : max
  )
  const peakCommission = (peakCommissionMonth.revenue * commissionRate) / 100

  const commissionData = projectionData.map(month => ({
    ...month,
    commission: (month.revenue * commissionRate) / 100
  }))

  const formatPercentage = (value) => `${(value || 0).toFixed(1)}%`

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(keyMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">12-month projection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(keyMetrics.avgMonthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(keyMetrics.peakRevenue)}</div>
            <p className="text-xs text-muted-foreground">{keyMetrics.peakMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(keyMetrics.volatility)}</div>
            <p className="text-xs text-muted-foreground">Revenue volatility</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monthly Trends
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Quarterly Analysis
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Zid Commission
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>12-month revenue projection with growth trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={projectionData} key={animationKey}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Bars</CardTitle>
                <CardDescription>Detailed monthly breakdown with projections</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectionData} key={animationKey}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Important findings from the projection analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Strong Q1 2026 Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Q1 2026 shows exceptional growth with {quarterlyData[1]?.growth}% quarter-over-quarter increase
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">High Revenue Volatility</h4>
                    <p className="text-sm text-muted-foreground">
                      Revenue shows significant month-over-month fluctuations requiring careful monitoring
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Peak Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      {keyMetrics.peakMonth} represents the highest single-month revenue at {formatCurrency(keyMetrics.peakRevenue)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Recovery Pattern</h4>
                    <p className="text-sm text-muted-foreground">
                      Strong recovery trend observed in Q3 2026 after mid-year decline
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Trends Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of monthly revenue trends and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={projectionData} key={animationKey}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectionData.map((month, index) => {
              const prevMonth = index > 0 ? projectionData[index - 1] : null
              const growth = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0
              const isPositive = growth >= 0
              
              return (
                <Card key={month.month}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{month.month}</CardTitle>
                      {month.projected && (
                        <Badge variant="outline" className="text-xs">Projected</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{formatCurrency(month.revenue)}</div>
                    {prevMonth && (
                      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {Math.abs(growth).toFixed(1)}% vs prev month
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Quarterly Analysis Tab */}
        <TabsContent value="quarterly" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Revenue</CardTitle>
                <CardDescription>Revenue performance by quarter with growth rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quarterlyData} key={animationKey}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rates</CardTitle>
                <CardDescription>Quarter-over-quarter growth analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quarterlyData.map((quarter) => (
                    <div key={quarter.quarter} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{quarter.quarter}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(quarter.revenue)}</div>
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${
                        quarter.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {quarter.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {quarter.growth.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>September 2026 Projection Scenarios</CardTitle>
              <CardDescription>Different projection scenarios for the final month based on various market conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {scenarioData.map((scenario) => (
                  <Card key={scenario.scenario} className="border-2" style={{ borderColor: scenario.color }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg" style={{ color: scenario.color }}>
                        {scenario.scenario}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(scenario.value)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        September 2026 projection
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart key={animationKey}>
                  <Pie
                    data={scenarioData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ scenario, value }) => `${scenario}: ${formatCurrency(value)}`}
                  >
                    {scenarioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission" className="space-y-6">
          {/* Commission Rate Management */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Rate Management</CardTitle>
              <CardDescription>
                View Zid's commission rate and earnings {!isAdmin() && "(Admin access required to modify)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="commission-rate">
                    Commission Rate (%) {!isAdmin() && "(Read Only)"}
                  </Label>
                  <Input
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    disabled={!isAdmin()}
                    className="mt-1"
                  />
                  {!isAdmin() && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Login as admin to modify commission rate
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                  <div className="text-sm text-muted-foreground">Total Commission</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(avgMonthlyCommission)}</div>
                  <div className="text-sm text-muted-foreground">Avg Monthly</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                <p className="text-xs text-muted-foreground">12-month earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Monthly Commission</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(avgMonthlyCommission)}</div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Commission Month</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(peakCommission)}</div>
                <p className="text-xs text-muted-foreground">{peakCommissionMonth.month}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissionRate}%</div>
                <p className="text-xs text-muted-foreground">Current rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Commission Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Trend</CardTitle>
                <CardDescription>Monthly commission earnings over 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={commissionData} key={`${animationKey}-${commissionRate}`}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Commission']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="commission" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission vs Revenue</CardTitle>
                <CardDescription>Comparison of revenue and commission earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={commissionData} key={`${animationKey}-${commissionRate}`}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(value), 
                        name === 'revenue' ? 'Revenue' : 'Commission'
                      ]}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="commission" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Commission"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Commission Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Commission Breakdown</CardTitle>
              <CardDescription>Detailed commission earnings for each month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commissionData.map((month, index) => {
                  const prevMonth = index > 0 ? commissionData[index - 1] : null
                  const growth = prevMonth ? ((month.commission - prevMonth.commission) / prevMonth.commission) * 100 : 0
                  const isPositive = growth >= 0
                  
                  return (
                    <Card key={month.month} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{month.month}</CardTitle>
                          {month.projected && (
                            <Badge variant="outline" className="text-xs">Projected</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold mb-1">{formatCurrency(month.commission)}</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Revenue: {formatCurrency(month.revenue)}
                        </div>
                        {prevMonth && (
                          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(growth).toFixed(1)}% vs prev
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

