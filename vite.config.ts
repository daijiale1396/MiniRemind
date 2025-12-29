
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 关键：确保打包后的资源路径是相对路径，否则 Electron 无法加载
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
