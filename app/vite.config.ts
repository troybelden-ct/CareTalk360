import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { eprcProxyPlugin } from "./server/eprc-proxy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Third arg "" loads ALL env vars (not just VITE_-prefixed ones) so the
  // EPRC proxy can read server-only credentials without exposing them to
  // the client bundle — they're consumed here in Node, never passed to
  // `define`/`import.meta.env`.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: mode === "production" ? "/CareTalk360/" : "/",
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger(), eprcProxyPlugin(env)].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
