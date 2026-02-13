import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Forzamos a que no se detenga si no encuentra el confeti en el empaquetado
      external: ['canvas-confetti'],
    }
  }
})