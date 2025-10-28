import { defineConfig } from "vite";
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/MiniSnake.ts'),
      name: "MiniSnake",
      fileName: "mini-snake"
    },
    modulePreload: false,
    rollupOptions: {
      treeshake: "smallest"
    },
    minify: "terser"
  },
  server: {
    port: 8080,
    open: true,
  },
});
