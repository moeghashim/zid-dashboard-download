import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, DollarSign, TrendingUp, Calendar, Package, RefreshCw, Cloud, CloudOff, Loader2, Download, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../contexts/ApiContext'
import { calculateBrandPerformance, calculateAggregatedData, calculateKeyMetrics, formatCurrency, MONTHS } from '../utils/revenueCalculations'

// Month options for starting month selection
const MONTH_OPTIONS = MONTHS.map((month, index) => ({ value: index, label: month }))

export default function EnhancedBrandPerformance() {
  const { isAdmin } = useAuth()
  const { 
    brands, 
    isLoading, 
    addBrand, 
    updateBrand, 
    deleteBrand,
    exportBrandsData,
    importBrandsData,
    resetBrands
  } = useApi()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    startingSales: '',
    monthlyGrowthRate: '',
    startingMonth: 0
  })
  const [formErrors, setFormErrors] = useState({})
  const [activeTab, setActiveTab] = useState('overview')
  const [importStatus, setImportStatus] = useState('')

  // Calculate metrics
  const keyMetrics = calculateKeyMetrics(brands)

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      startingSales: '',
      monthlyGrowthRate: '',
      startingMonth: 0
    })
    setFormErrors({})
    setShowAddForm(false)
    setEditingBrand(null)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Brand name is required'
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required'
    }
    
    const startingSales = parseFloat(formData.startingSales)
    if (!formData.startingSales || isNaN(startingSales) || startingSales <= 0) {
      errors.startingSales = 'Valid starting sales amount is required'
    }
    
    const growthRate = parseFloat(formData.monthlyGrowthRate)
    if (!formData.monthlyGrowthRate || isNaN(growthRate)) {
      errors.monthlyGrowthRate = 'Valid growth rate is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const brandData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        startingSales: parseFloat(formData.startingSales),
        monthlyGrowthRate: parseFloat(formData.monthlyGrowthRate),
        startingMonth: parseInt(formData.startingMonth)
      }
      
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandData)
      } else {
        await addBrand(brandData)
      }
      
      resetForm()
    } catch (err) {
      console.error('Error saving brand:', err)
      setFormErrors({ submit: err.message })
    }
  }

  const handleEdit = (brand) => {
    setFormData({
      name: brand.name,
      category: brand.category,
      startingSales: brand.startingSales.toString(),
      monthlyGrowthRate: brand.monthlyGrowthRate.toString(),
      startingMonth: brand.startingMonth || 0
    })
    setEditingBrand(brand)
    setShowAddForm(true)
  }

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(brandId)
      } catch (err) {
        console.error('Error deleting brand:', err)
      }
    }
  }

  const handleImportFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setImportStatus('Importing...')
      const result = await importBrandsData(file)
      setImportStatus(`Successfully imported ${result.imported} brands!`)
      setTimeout(() => setImportStatus(''), 3000)
    } catch (error) {
      setImportStatus(`Import failed: ${error.message}`)
      setTimeout(() => setImportStatus(''), 5000)
    }

    // Reset file input
    event.target.value = ''
  }

  if (isLoading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading brand data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Brand Performance</h1>
          <p className="text-muted-foreground">
            Manage brands with starting months and cloud synchronization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Export/Import Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportBrandsData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            
            {isAdmin() && (
              <>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-file').click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.confirm('Reset all brands to default data?') && resetBrands()}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Data
                </Button>
              </>
            )}
          </div>

          {/* Add Brand Button */}
          {isAdmin() && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          )}
        </div>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`p-3 rounded-md ${importStatus.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {importStatus}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(keyMetrics.averageMonthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(keyMetrics.peakMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">{keyMetrics.peakMonth}</p>
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

      {/* Add/Edit Brand Form */}
      {showAddForm && isAdmin() && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</CardTitle>
            <CardDescription>
              {editingBrand ? 'Update brand information' : 'Add a new brand to your portfolio'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Brand Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter brand name"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Premium Food"
                    className={formErrors.category ? 'border-red-500' : ''}
                  />
                  {formErrors.category && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="startingSales">Starting Sales ($)</Label>
                  <Input
                    id="startingSales"
                    type="number"
                    value={formData.startingSales}
                    onChange={(e) => setFormData(prev => ({ ...prev, startingSales: e.target.value }))}
                    placeholder="e.g., 50000"
                    className={formErrors.startingSales ? 'border-red-500' : ''}
                  />
                  {formErrors.startingSales && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.startingSales}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="monthlyGrowthRate">Monthly Growth Rate (%)</Label>
                  <Input
                    id="monthlyGrowthRate"
                    type="number"
                    step="0.1"
                    value={formData.monthlyGrowthRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyGrowthRate: e.target.value }))}
                    placeholder="e.g., 5.5"
                    className={formErrors.monthlyGrowthRate ? 'border-red-500' : ''}
                  />
                  {formErrors.monthlyGrowthRate && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.monthlyGrowthRate}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="startingMonth">Starting Month</Label>
                  <Select
                    value={formData.startingMonth.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, startingMonth: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select starting month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_OPTIONS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    The month when this brand starts generating revenue
                  </p>
                </div>
              </div>

              {formErrors.submit && (
                <div className="text-sm text-red-500">{formErrors.submit}</div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingBrand ? 'Update Brand' : 'Add Brand'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Brand Management Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Brand Management</CardTitle>
              <CardDescription>
                Manage your brand portfolio with starting months and growth rates
              </CardDescription>
            </div>
            {!isAdmin() && (
              <Badge variant="secondary">Read Only Access</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Brand</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Starting Sales</th>
                  <th className="text-left py-2">Growth Rate</th>
                  <th className="text-left py-2">Starting Month</th>
                  <th className="text-left py-2">12M Revenue</th>
                  {isAdmin() && <th className="text-left py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => {
                  const brandPerformance = calculateBrandPerformance(brand)
                  const totalRevenue = brandPerformance.reduce((sum, month) => sum + month.revenue, 0)
                  const startingMonthLabel = MONTH_OPTIONS.find(m => m.value === (brand.startingMonth || 0))?.label || 'Oct 2025'
                  
                  return (
                    <tr key={brand.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{brand.name}</div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline">{brand.category}</Badge>
                      </td>
                      <td className="py-3">{formatCurrency(brand.startingSales)}</td>
                      <td className="py-3">{brand.monthlyGrowthRate}%</td>
                      <td className="py-3">
                        <Badge variant="secondary">{startingMonthLabel}</Badge>
                      </td>
                      <td className="py-3 font-medium">{formatCurrency(totalRevenue)}</td>
                      {isAdmin() && (
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(brand)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(brand.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}

