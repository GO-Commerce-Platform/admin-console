import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Vue feature flags
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/composables': resolve(__dirname, './src/composables'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/assets': resolve(__dirname, './src/assets'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/layouts': resolve(__dirname, './src/layouts'),
      '@/router': resolve(__dirname, './src/router'),
      // Fix Vue runtime compilation issue
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },

  // Dependency optimization configuration - simplified
  optimizeDeps: {
    // Force re-optimization on startup
    force: true,
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },

  // Build configuration
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@chakra-ui/vue-next'],
          'utils-vendor': ['axios', '@vueuse/core', 'date-fns'],
        },
      },
    },
  },

  // Testing configuration (for Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
