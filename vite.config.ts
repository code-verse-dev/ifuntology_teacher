import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": { target: "http://localhost:3030", changeOrigin: true },
      "/Uploads": { target: "http://localhost:3030", changeOrigin: true },
      "/uploads": { target: "http://localhost:3030", changeOrigin: true },
      "/fonts": { target: "http://localhost:3030", changeOrigin: true },
      "/pdfs": { target: "https://erp.ifuntology.com", changeOrigin: true, secure: false },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
