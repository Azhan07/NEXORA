import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Heavy libraries get their own chunks so the 3D engine is only
        // downloaded when a page with a 3D scene is opened.
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
