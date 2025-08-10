import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Simple API handler for development
function devAPIPlugin() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        console.log('API Request:', req.method, req.url)
        if (req.url.startsWith('/brands')) {
          try {
            // Create Vercel-compatible response object
            const mockRes = {
              status: (code) => ({
                json: (data) => {
                  res.writeHead(code, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify(data))
                  return mockRes
                }
              }),
              setHeader: (name, value) => res.setHeader(name, value),
              writeHead: (code, headers) => res.writeHead(code, headers),
              end: (data) => res.end(data)
            }

            // Import the API handler dynamically
            const { default: handler } = await import('./api/brands.js')
            await handler(req, mockRes)
          } catch (error) {
            console.error('API Error:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devAPIPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './', // Use relative paths for deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})

