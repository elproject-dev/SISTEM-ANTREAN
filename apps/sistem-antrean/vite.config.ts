import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/SISTEM-ANTREAN/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Mock the workspace api-client used by @elproject/ui components
      '@workspace/api-client-react': path.resolve(
        __dirname,
        '../../packages/ui/src/mocks/api-client-react.ts'
      ),
      'stream': path.resolve(
        __dirname,
        '../../packages/ui/src/mocks/stream-mock.js'
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    open: true,
  },
  build: {
    cssMinify: 'esbuild',
  },
})
