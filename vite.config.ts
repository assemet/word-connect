import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import react from '@vitejs/plugin-react';
import { TanStackStart } from '@tanstack/react-start/vite';

export default defineConfig({
  plugins: [
    react(),
    TanStackStart(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'public/index.html',
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
