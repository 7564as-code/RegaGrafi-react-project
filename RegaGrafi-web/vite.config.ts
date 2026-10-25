import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // כל בקשה שמתחילה ב-/api או ב-/auth עוברת מ-Vite אל השרת (Next.js).
    // כך הדפדפן חושב שהכול מגיע מאותה כתובת, וה-cookies של ההתחברות עובדים.
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
