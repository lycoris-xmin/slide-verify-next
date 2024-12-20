import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/slider-verify/slider-verify.vue'),
      name: 'SlideVerifyNext',
      fileName: format => `slide-verify-next.${format}.js`
    },
    rollupOptions: {
      external: ['vue']
    }
  }
})
