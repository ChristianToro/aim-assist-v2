import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves project sites from /<repo>/, so every asset URL has
  // to be prefixed or the deployed page loads nothing. Applied in dev too
  // (the dev server moves to /Aim_Assist/) so local and production paths
  // behave identically — BASE_URL feeds the router's basename in App.jsx.
  base: '/Aim_Assist/',
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
