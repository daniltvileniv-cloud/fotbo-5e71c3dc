import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// allowedHosts is REQUIRED: the preview runs on a <id>.preview.ai.fbo.site
// subdomain and Vite answers 403 "Blocked request" to unknown Host headers.
// '.fbo.site' covers both the preview and the published <name>.fbo.site domain.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { allowedHosts: ['.fbo.site'] },
  server: {
    allowedHosts: ['.fbo.site'],
    proxy: { '/api': 'http://localhost:3001' },
  },
})
