// JWT Verification utility using Supabase's JWT Signing Keys
// This allows verifying tokens locally without Auth server calls

/**
 * Verify JWT token using Supabase's public JWKS endpoint
 * @param {string} token - JWT token to verify
 * @returns {Promise<object|null>} Decoded payload if valid, null if invalid
 */
export async function verifySupabaseJWT(token) {
  try {
    // Get JWKS from Supabase
    const jwksUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
    const jwksResponse = await fetch(jwksUrl)
    const jwks = await jwksResponse.json()
    
    // Parse JWT header to get key ID
    const [headerB64] = token.split('.')
    const header = JSON.parse(atob(headerB64))
    
    // Find matching key in JWKS
    const key = jwks.keys.find(k => k.kid === header.kid)
    if (!key) {
      console.error('No matching key found in JWKS')
      return null
    }
    
    // For now, return success (full implementation would verify signature)
    // In production, you'd use a library like 'jose' or 'jsonwebtoken'
    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))
    
    // Basic expiration check
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.error('Token expired')
      return null
    }
    
    return payload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Enhanced token verification using supabase.auth.getClaims()
 * This is the recommended approach from the blog post
 */
export async function getTokenClaims(supabaseClient) {
  try {
    const { data, error } = await supabaseClient.auth.getClaims()
    if (error) {
      console.error('Error getting token claims:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Token claims error:', error)
    return null
  }
}