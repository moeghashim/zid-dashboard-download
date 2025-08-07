import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Plus, Trash2, Edit3, Save, X,
  Package, DollarSign, Percent, BarChart3, PieChart as PieChartIcon
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useBrands } from '../contexts/BrandContext'
import { 
  months, 
  categoryColors, 
  calculateBrandPerformance, 
  calculateAggregatedData,
  formatCurrency 
} from '../utils/revenueCalculations'

export default function BrandPerformance() {
  const [editingBrand, setEditingBrand] = useState(null)
  const [newBrand, setNewBrand] = useState({ name: '', category: '', startingSales: '', monthlyGrowthRate: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const { isAdmin } = useAuth()
  const { brands, isLoading, addBrand, updateBrand, deleteBrand } = useBrands()

  // Use shared calculation functions with brands from context
  const { monthlyTotals, brandPerformances } = calculateAggregatedData(brands)

  // Calculate category performance
  const calculateCategoryPerformance = () => {
    const categoryTotals = {}
    
    brands.forEach(brand => {
      const performance = calculateBrandPerformance(brand)
      const totalSales = performance.reduce((sum, month) => sum + month.sales, 0)
      
      if (!categoryTotals[brand.category]) {
        categoryTotals[brand.category] = 0
      }
      categoryTotals[brand.category] += totalSales
    })
    
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      color: categoryColors[category] || '#6b7280'
    }))
  }

  const categoryData = calculateCategoryPerformance()

  // Handle brand operations using context methods
  const handleAddBrand = () => {
    if (newBrand.name && newBrand.category && newBrand.startingSales && newBrand.monthlyGrowthRate) {
      addBrand(newBrand)
      setNewBrand({ name: '', category: '', startingSales: '', monthlyGrowthRate: '' })
      setShowAddForm(false)
    }
  }

  const handleEditBrand = (brand) => {
    setEditingBrand({ ...brand })
  }

  const handleSaveBrand = () => {
    updateBrand(editingBrand.id, editingBrand)
    setEditingBrand(null)
  }

  const handleDeleteBrand = (brandId) => {
    deleteBrand(brandId)
  }

  // Prepare chart data
  const chartData = months.map((month, index) => {
    const monthData = { month }
    brands.forEach(brand => {
      const performance = brandPerformances[brand.name]
      monthData[brand.name] = performance[index].sales
    })
    monthData.total = monthlyTotals[index].total
    return monthData
  })

  const totalRevenue = monthlyTotals.reduce((sum, month) => sum + month.total, 0)
  const avgMonthlyRevenue = totalRevenue / 12
  const peakMonth = monthlyTotals.reduce((max, month) => month.total > max.total ? month : max)

  // Show loading state while brands are loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading brand data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Performance Management</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin() 
              ? "Manage brand categories, growth rates, and track performance across all brands"
              : "View brand performance and analytics (Admin access required to modify brands)"
            }
          </p>
        </div>
        {isAdmin() ? (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        ) : (
          <Badge variant="secondary" className="px-4 py-2">
            Read Only Access
          </Badge>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">12-month projection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgMonthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(peakMonth.total)}</div>
            <p className="text-xs text-muted-foreground">{peakMonth.month}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
            <p className="text-xs text-muted-foreground">Managed brands</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Brand Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add New Brand
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newBrand.category}
                  onChange={(e) => setNewBrand({ ...newBrand, category: e.target.value })}
                  placeholder="e.g., Premium Food"
                />
              </div>
              <div>
                <Label htmlFor="startingSales">Starting Sales ($)</Label>
                <Input
                  id="startingSales"
                  type="number"
                  value={newBrand.startingSales}
                  onChange={(e) => setNewBrand({ ...newBrand, startingSales: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>
              <div>
                <Label htmlFor="growthRate">Monthly Growth Rate (%)</Label>
                <Input
                  id="growthRate"
                  type="number"
                  step="0.1"
                  value={newBrand.monthlyGrowthRate}
                  onChange={(e) => setNewBrand({ ...newBrand, monthlyGrowthRate: e.target.value })}
                  placeholder="e.g., 5.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBrand}>
                Add Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Management</CardTitle>
          <CardDescription>
            {isAdmin() 
              ? "Manage your brand portfolio with custom categories and growth rates"
              : "View your brand portfolio and performance metrics"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Brand</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-right p-2 font-medium">Starting Sales</th>
                  <th className="text-right p-2 font-medium">Growth Rate</th>
                  <th className="text-right p-2 font-medium">12M Revenue</th>
                  {isAdmin() && <th className="text-center p-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => {
                  const performance = calculateBrandPerformance(brand)
                  const totalRevenue = performance.reduce((sum, month) => sum + month.sales, 0)
                  
                  return (
                    <tr key={brand.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{brand.name}</td>
                      <td className="p-2">
                        <Badge 
                          variant="secondary" 
                          style={{ backgroundColor: `${categoryColors[brand.category] || '#6b7280'}20`, 
                                   color: categoryColors[brand.category] || '#6b7280' }}
                        >
                          {brand.category}
                        </Badge>
                      </td>
                      <td className="text-right p-2 font-mono">{formatCurrency(brand.startingSales)}</td>
                      <td className="text-right p-2">
                        <span className="flex items-center justify-end gap-1">
                          <Percent className="h-3 w-3" />
                          {brand.monthlyGrowthRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right p-2 font-mono font-bold">{formatCurrency(totalRevenue)}</td>
                      {isAdmin() && (
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditBrand(brand)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteBrand(brand.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!isAdmin() && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                🔒 Admin access required to add, edit, or delete brands
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Brand Modal */}
      {editingBrand && (
        <Card className="fixed inset-0 z-50 m-8 max-w-md mx-auto my-auto h-fit bg-background border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Edit Brand: {editingBrand.name}
              <Button variant="ghost" size="sm" onClick={() => setEditingBrand(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Brand Name</Label>
                <Input
                  id="editName"
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Input
                  id="editCategory"
                  value={editingBrand.category}
                  onChange={(e) => setEditingBrand({ ...editingBrand, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editStartingSales">Starting Sales ($)</Label>
                <Input
                  id="editStartingSales"
                  type="number"
                  value={editingBrand.startingSales}
                  onChange={(e) => setEditingBrand({ ...editingBrand, startingSales: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="editGrowthRate">Monthly Growth Rate (%)</Label>
                <Input
                  id="editGrowthRate"
                  type="number"
                  step="0.1"
                  value={editingBrand.monthlyGrowthRate}
                  onChange={(e) => setEditingBrand({ ...editingBrand, monthlyGrowthRate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingBrand(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBrand}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="brands">Brand Comparison</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue Projection</CardTitle>
              <CardDescription>Combined revenue from all brands over 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="totalRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000)}K`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Total Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#totalRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Performance Comparison</CardTitle>
              <CardDescription>Individual brand revenue trends over 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000)}K`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  {brands.map((brand, index) => (
                    <Line 
                      key={brand.id}
                      type="monotone" 
                      dataKey={brand.name} 
                      stroke={categoryColors[brand.category] || `hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Revenue distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, total }) => `${category}: ${formatCurrency(total)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Total revenue by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Total Revenue']}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

