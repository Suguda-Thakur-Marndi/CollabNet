import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      events: 'events',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['simple-peer', 'buffer', 'process', 'util'],
  },
})
