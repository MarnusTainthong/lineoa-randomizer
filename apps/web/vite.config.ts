/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // The repo-root .env is shared with the API.
  envDir: '../..',
  server: { host: true, port: 5173, allowedHosts: true },
  test: { environment: 'jsdom' },
});
