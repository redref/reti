/// <reference types="vitest" />
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { version } from './package.json'

/**
 * This plugin replaces the `__APP_VERSION__` placeholder in the `public/version.json` file
 */
const replaceVersionPlugin = () => {
  let outDir
  return {
    name: 'replace-version-in-json',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      outDir = config.build.outDir
    },
    generateBundle() {
      try {
        const filePath = path.resolve(__dirname, 'public/version.json')
        if (!fs.existsSync(filePath)) {
          throw new Error(`version.json not found at ${filePath}`)
        }
        const content = fs.readFileSync(filePath, 'utf-8')
        const updatedContent = content.replace('__APP_VERSION__', version)
        const newFilePath = path.resolve(outDir, 'version.json')
        fs.writeFileSync(newFilePath, updatedContent, 'utf-8')
      } catch (error) {
        console.error('Failed to replace version in version.json file:', error)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    replaceVersionPlugin(),
    TanStackRouterVite(),
    nodePolyfills({
      include: ['path', 'stream', 'util'],
      exclude: ['http'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: 'memfs',
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  test: {
    name: 'reti-ui',
    dir: './src',
    watch: false,
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          algorand: ['algosdk', '@algorandfoundation/algokit-utils'],
          icons: ['lucide-react', '@radix-ui/react-icons'],
          tremor: ['@tremor/react'],
          useWallet: ['@txnlab/use-wallet-react'],
        },
      },
    },
  },
})
