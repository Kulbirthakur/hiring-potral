import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://hiring-portal-backend-z90d.onrender.com')
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://hiring-portal-backend-z90d.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
