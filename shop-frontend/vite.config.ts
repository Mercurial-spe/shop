import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
