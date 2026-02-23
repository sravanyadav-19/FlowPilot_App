import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Note: This project uses react-scripts (CRA) for builds.
// This file exists for potential Vite migration.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
})