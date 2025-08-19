// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/EvaluadorCorales2.2/',  // 👈 EXACTO el nombre del repo
  build: { outDir: 'docs' }       // 👈 GitHub Pages publica desde /docs
})
