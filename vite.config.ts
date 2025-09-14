import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Avoid requiring @types/node for this small usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target: ((process as any)?.env?.VITE_API_PROXY_TARGET) || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
