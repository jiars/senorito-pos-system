import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  // Compatibility bridge for older CommonJS browser dependencies such as
  // convert-units@2, whose Lodash dependency still references Node's `global`.
  define: {
    global: "globalThis",
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Senorito POS System",
        short_name: "SenoritoPOS",
        description: "POS and Inventory System for Senorito",
        theme_color: "#7A4B35",
        background_color: "#F8F9FA",
        display: "standalone",
        icons: [
          {
            src: "senorito_logo_192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "senorito_logo_512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
