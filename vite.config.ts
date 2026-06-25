import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Katalog-Book-app/', // ganti dengan nama repo GitHub Anda
});
