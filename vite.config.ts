/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

function karirfyMultiPageSpaPlugin() {
  const rewriteSpaRoutes = (url?: string) => {
    if (!url) return url;
    const [pathname, search = ''] = url.split('?');
    if (
      pathname === '/login' ||
      pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/')
    ) {
      return `/app.html${search ? `?${search}` : ''}`;
    }
    if (pathname === '/privacy') return '/privacy.html';
    if (pathname === '/terms') return '/terms.html';
    if (pathname === '/support') return '/support.html';
    if (pathname === '/delete-account' || pathname === '/hapus-akun') {
      return '/privacy.html#choices';
    }
    return url;
  };

  return {
    name: 'karirfy-multipage-spa-rewrite',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewriteSpaRoutes(req.url);
        next();
      });
    },
    configurePreviewServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewriteSpaRoutes(req.url);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), karirfyMultiPageSpaPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        landing: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app.html'),
      },
      output: {
        manualChunks: {
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-docs': ['docx', 'pdfmake'],
          'vendor-router': ['react-router-dom'],
        },
      },
    },
  },
});
