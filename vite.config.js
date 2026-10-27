import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    // The firebase vendor chunk is inherently ~560 kB minified (the SDK
    // itself); it's split out below so it caches independently of app code.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Split the big stable dependencies into their own chunks so
        // app-code changes don't invalidate the (large) Firebase bundle
        // in users' caches.
        advancedChunks: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/]@?firebase/ },
            // The Neon Auth SDK and what it bundles (~68 kB gzip): Better
            // Auth, zod, and @supabase/auth-js for its error classes.
            {
              name: 'auth-vendor',
              test: /node_modules[\\/](@neondatabase[\\/]auth|better-auth|@better-auth|better-call|@better-fetch|@supabase|zod|nanostores|defu)[\\/]/,
            },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
