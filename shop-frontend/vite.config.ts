import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => (id.includes('node_modules/echarts') || id.includes('node_modules/zrender') ? 'echarts' : undefined),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/100191209_p0.jpg': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
