import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/quickinvoice/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/quickinvoice/',
        name: 'QuickInvoice',
        short_name: 'QuickInvoice',
        description: 'Simple invoice and quotation maker',
        theme_color: '#172B4D',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/quickinvoice/',
        start_url: '/quickinvoice/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
}))
