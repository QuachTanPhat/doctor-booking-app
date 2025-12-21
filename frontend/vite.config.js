import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {port: 5173},
  headers: {
      // Thêm dòng này để cho phép Google Popup giao tiếp với Localhost
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
})
