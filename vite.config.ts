import { defineConfig } from "vite";
import { resolve } from 'path';
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/MiniSnake.ts'),
      name: "MiniSnake",
      fileName: "mini-snake"
    },
    rollupOptions: {
      treeshake: "smallest"
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 3,
      },
      mangle: true,
    }
  },
  plugins: [dts({
    rollupTypes: true,
    tsconfigPath: "./tsconfig.json",
  })],
  server: {
    port: 8080,
    open: true,
  },
});
