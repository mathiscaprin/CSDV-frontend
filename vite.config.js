import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://clicker-sdv-back.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/session': {
        target: 'https://clicker-sdv-back.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/batiments': {
        target: 'https://clicker-sdv-back.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
}))
