#!/usr/bin/env node

/**
 * Script to delete specific brands: Tech Innovators, Fashion Forward, and Health & Wellness
 * This script will work with both localStorage (BrandContext) and API/Database (ApiContext)
 */

const brandsToDelete = [
  "Tech Innovators",
  "Fashion Forward", 
  "Health & Wellness"
];

console.log('🗑️  Brand Deletion Script');
console.log('=========================');
console.log('Target brands to delete:');
brandsToDelete.forEach(brand => console.log(`  - ${brand}`));
console.log('');

// Function to delete brands from API/Database
async function deleteBrandsFromAPI() {
  console.log('🌐 Attempting to delete brands from API/Database...');
  
  try {
    // First, fetch all brands to get their IDs
    const response = await fetch('/api/brands');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch brands');
    }
    
    const brands = data.brands;
    console.log(`Found ${brands.length} brands in database`);
    
    // Find target brands
    const targetBrands = brands.filter(brand => 
      brandsToDelete.includes(brand.name)
    );
    
    console.log(`Found ${targetBrands.length} target brands to delete:`);
    targetBrands.forEach(brand => console.log(`  - ${brand.name} (ID: ${brand.id})`));
    
    // Delete each target brand
    const deletePromises = targetBrands.map(async (brand) => {
      try {
        const deleteResponse = await fetch(`/api/brands?id=${brand.id}`, {
          method: 'DELETE'
        });
        
        const deleteData = await deleteResponse.json();
        
        if (deleteData.success) {
          console.log(`  ✅ Deleted: ${brand.name}`);
          return { success: true, brand: brand.name };
        } else {
          console.log(`  ❌ Failed to delete ${brand.name}: ${deleteData.error}`);
          return { success: false, brand: brand.name, error: deleteData.error };
        }
      } catch (error) {
        console.log(`  ❌ Error deleting ${brand.name}: ${error.message}`);
        return { success: false, brand: brand.name, error: error.message };
      }
    });
    
    const results = await Promise.all(deletePromises);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`\n📊 API Deletion Results:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    
    return results;
    
  } catch (error) {
    console.log(`❌ API deletion failed: ${error.message}`);
    return [];
  }
}

// Function to delete brands from localStorage
function deleteBrandsFromLocalStorage() {
  console.log('\n💾 Attempting to delete brands from localStorage...');
  
  try {
    const savedBrands = localStorage.getItem('zid-global-brands');
    
    if (!savedBrands) {
      console.log('  ⚠️  No brands found in localStorage');
      return [];
    }
    
    const brands = JSON.parse(savedBrands);
    console.log(`  Found ${brands.length} brands in localStorage`);
    
    // Find target brands
    const targetBrands = brands.filter(brand => 
      brandsToDelete.includes(brand.name)
    );
    
    console.log(`  Found ${targetBrands.length} target brands to delete:`);
    targetBrands.forEach(brand => console.log(`    - ${brand.name} (ID: ${brand.id})`));
    
    // Filter out target brands
    const remainingBrands = brands.filter(brand => 
      !brandsToDelete.includes(brand.name)
    );
    
    // Save back to localStorage
    localStorage.setItem('zid-global-brands', JSON.stringify(remainingBrands));
    
    console.log(`  ✅ Deleted ${targetBrands.length} brands from localStorage`);
    console.log(`  📊 Remaining brands: ${remainingBrands.length}`);
    
    return targetBrands;
    
  } catch (error) {
    console.log(`  ❌ localStorage deletion failed: ${error.message}`);
    return [];
  }
}

// Main execution function
async function main() {
  console.log('🚀 Starting brand deletion process...\n');
  
  // Delete from API/Database first
  const apiResults = await deleteBrandsFromAPI();
  
  // Then delete from localStorage (fallback/backup)
  const localResults = deleteBrandsFromLocalStorage();
  
  console.log('\n🎉 Deletion process completed!');
  console.log(`📋 Summary:`);
  console.log(`  - API deletions attempted: ${apiResults.length}`);
  console.log(`  - localStorage deletions: ${localResults.length}`);
  console.log('\n⚠️  Note: You may need to refresh the dashboard to see changes reflected in the UI.');
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🌐 Running in browser environment');
  console.log('📋 To execute deletion, run: main()');
  window.deleteBrandsScript = { main, deleteBrandsFromAPI, deleteBrandsFromLocalStorage };
} else {
  // Node.js environment
  console.log('📋 Note: This script is designed to run in a browser environment with access to the dashboard API.');
  console.log('📋 Copy and paste this script into your browser console while on the dashboard page.');
}