import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const modulePath = id.replace(/\\/g, '/')
          if (modulePath.includes('/node_modules/genlayer-js/')) return 'genlayer-sdk'
          if (modulePath.includes('/node_modules/viem/')) return 'viem'
          if (modulePath.includes('/node_modules/react/') || modulePath.includes('/node_modules/react-dom/')) return 'react-vendor'
        },
      },
    },
  },
})
