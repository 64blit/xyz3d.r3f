import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import CustomHmr from './CustomHmr'

// This is required for Vite to work correctly with CodeSandbox
const server = process.env.APP_ENV === 'sandbox' ? { hmr: { clientPort: 443 } } : {}

// https://vitejs.dev/config/
export default defineConfig({
  server: server,
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },

  plugins: [react(), CustomHmr()],
})
