import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "node:path";
import netlifyReactRouter from "@netlify/vite-plugin-react-router";

export default defineConfig({
  server: { host: true, port: 8081 },
  plugins: [reactRouter(), netlifyReactRouter({ excludedPaths: ["/sitemap.xml"] })],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
