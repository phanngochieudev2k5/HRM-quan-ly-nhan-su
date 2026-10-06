import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/HRM-quan-ly-nhan-su/',
  server: {
    port: 3000,
    open: false
  }
});
