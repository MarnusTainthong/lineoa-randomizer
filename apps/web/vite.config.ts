/// <reference types="vitest" />
import { copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const webRoot = dirname(fileURLToPath(import.meta.url));

/** LIFF entry paths. Static hosting serves results.html for /results. */
function richMenuHtml(): Plugin {
  return {
    name: 'rich-menu-html',
    apply: 'build',
    closeBundle() {
      const dist = resolve(webRoot, 'dist');
      const indexHtml = resolve(dist, 'index.html');
      for (const route of ['results', 'manage']) {
        copyFileSync(indexHtml, resolve(dist, `${route}.html`));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), richMenuHtml()],
  // The repo-root .env is shared with the API.
  envDir: '../..',
  server: { host: true, port: 5173, allowedHosts: true },
  test: { environment: 'jsdom' },
});
