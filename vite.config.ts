import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
      treeshake: "smallest"
    },
  },
  server: {
    port: 8080,
    open: true,
  },
});
