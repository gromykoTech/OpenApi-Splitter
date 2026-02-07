import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/OpenApi-Splitter/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features/'),
      '@layouts': path.resolve(__dirname, './src/layouts/'),
      '@api-types': path.resolve(__dirname, './src/features/splitter/types/'),
      '@stores': path.resolve(__dirname, './src/stores/'),
    },
  },
});
