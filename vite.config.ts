import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"
import { viteStaticCopy } from "vite-plugin-static-copy"
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  build : {
    outDir: 'dist'
  },
  plugins: [
    react(),
    tsconfigPaths(),
    viteSingleFile(),
    viteStaticCopy({ targets: [{ src: "app-script/*", dest: "./" }] }),
  ],
})
