import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@root-core': path.resolve(__dirname, '../src/core'),
      '@root-lib': path.resolve(__dirname, '../src/lib')
    }
  },
  server: {
    fs: {
      allow: [
        '.',
        path.resolve(__dirname, '../src/core'),
        path.resolve(__dirname, '../src/lib')
      ]
    }
  }
})
