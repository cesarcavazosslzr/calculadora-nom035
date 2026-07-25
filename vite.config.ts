import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so GitHub Pages project sites and local preview both work.
export default defineConfig({
  plugins: [react()],
  base: './',
})
