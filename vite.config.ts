import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: () => 'everything',
      },
    },
  },
  server: {
    port: 8080,
    open: true,
  },
});
