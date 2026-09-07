import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "node:path";

export default defineConfig({
  server: { host: true, port: 8081 },
  plugins: [reactRouter()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
