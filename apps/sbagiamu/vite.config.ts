import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/SBAGIAMU/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'pwa-icon.png'],
      manifest: {
        name: 'SBAGIAMU POS',
        short_name: 'SBAGIAMU',
        description: 'Aplikasi Point of Sales SBAGIAMU',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@workspace/api-client-react": path.resolve(__dirname, "src/mocks/api-client-react.ts"),
      "stream": path.resolve(__dirname, "src/mocks/stream-mock.js"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // Menghilangkan warning 500kb dengan menaikkan limitnya
    cssMinify: 'esbuild', // Menggunakan esbuild untuk minify CSS agar terhindar dari error lightningcss dengan @utility di Tailwind
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('wouter')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('framer-motion') || id.includes('react-day-picker') || id.includes('vaul')) {
              return 'ui';
            }
            if (id.includes('@capacitor')) {
              return 'capacitor';
            }
            if (id.includes('@tauri-apps')) {
              return 'tauri';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('xlsx-js-style') || id.includes('xlsx')) {
              return 'excel';
            }
            if (id.includes('date-fns') || id.includes('zod') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('sonner')) {
              return 'utils';
            }
            return 'vendor-other';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: true,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/target/**'],
    },
    allowedHosts: [
      "directed-zigzagged-haunt.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
      "localhost",
    ],
  },
});
