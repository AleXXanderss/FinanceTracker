import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/transactions': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/budgets': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/recurring-transactions': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/tags': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
});
