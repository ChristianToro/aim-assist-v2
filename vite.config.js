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
    rolldownOptions: {
      output: {
        // Split the big stable dependencies into their own chunks so
        // app-code changes don't invalidate them in users' caches.
        advancedChunks: {
          groups: [
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
