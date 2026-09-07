import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react()],
  server: {
    proxy: {
      // The official FPL API doesn't send CORS headers, so browser requests
      // to it directly are blocked. This dev-only proxy works around that;
      // production will need a real server-side proxy (e.g. a Supabase Edge Function).
      '/fpl-api': {
        target: 'https://fantasy.premierleague.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fpl-api/, ''),
      },
    },
  },
})
