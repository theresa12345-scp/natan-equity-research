import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'safari >= 12', 'iOS >= 12'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  build: {
    // Safari compatibility - es2019 supports Safari 13.1+
    target: 'es2019',
    // Ensure compatibility with older browsers
    cssTarget: 'safari12',
  },
})
