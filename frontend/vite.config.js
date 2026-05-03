import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const certKey  = path.resolve(__dirname, '../backend/certs/server.key')
const certFile = path.resolve(__dirname, '../backend/certs/server.crt')
const certsExist = fs.existsSync(certKey) && fs.existsSync(certFile)

export default defineConfig({
  plugins: [react()],
  server: {
    https: certsExist
      ? { key: fs.readFileSync(certKey), cert: fs.readFileSync(certFile) }
      : false,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
