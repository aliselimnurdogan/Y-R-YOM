import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function classicScripts(): Plugin {
  return {
    name: 'classic-scripts',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const cleaned = html
          .replace(/<link rel="modulepreload"[^>]*>/g, '')
          .replace(/\s+crossorigin(="[^"]*")?/g, '')
          .replace(/\s+type="module"/g, '')
          .replace(/<script src="\.\/app\.js"><\/script>/, '')
        return {
          html: cleaned,
          tags: [
            {
              tag: 'script',
              attrs: { src: './app.js', defer: true },
              injectTo: 'body',
            },
          ],
        }
      },
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), classicScripts()],
  server: {
    watch: {
      ignored: ['**/scripts/**'],
    },
  },
  build: {
    outDir: 'site',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'Yuruyom',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: '[name][extname]',
      },
    },
  },
})
