import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/, // Matches .js, .jsx, .ts, and .tsx files
  },
  server: {
    open: true, // Automatically open the browser when the server starts
    port: 5176, // Ensure the port matches the one you're trying to access
  },
});
