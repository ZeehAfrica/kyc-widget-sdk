import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: path.resolve(__dirname, "playground"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@zeeh/kyc-react-sdk": path.resolve(__dirname, "src/index.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
  },
});
