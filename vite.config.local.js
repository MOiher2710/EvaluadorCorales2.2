// vite.config.local.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Evaluador de Corales',
        short_name: 'Corales',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0f4c5c',
        theme_color: '#0f4c5c',
        icons: [
          { src: 'logo2.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo2.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'] },
      includeAssets: ['logo.jpg', 'logo2.png']
    })
  ],
  base: './',                 // para servir en localhost
  build: {
    outDir: 'docs',
    rollupOptions: {
      // 👇 evita que rollup intente resolver el módulo opcional de macOS
      external: ['fsevents']
    }
  }
})
