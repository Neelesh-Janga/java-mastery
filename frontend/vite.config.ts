import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  worker: {
    format: 'es',
  },

  optimizeDeps: {
    // Include the Monaco editor worker so Vite pre-bundles it
    include: ['monaco-editor/esm/vs/editor/editor.worker'],
  },

  build: {
    rollupOptions: {
      output: {
        // Keep Monaco in its own chunk for better caching
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
        },
      },
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
