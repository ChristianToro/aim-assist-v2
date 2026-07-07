import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
