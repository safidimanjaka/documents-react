import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Chemin vers cert/key générés localement (mkcert ou openssl)
const certPath = path.resolve(__dirname, "certs");
const keyFile = path.join(certPath, "localhost-key.pem");
const certFile = path.join(certPath, "localhost.pem");

const httpsOptions = (function () {
  try {
    if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
      return {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile)
      };
    }
  } catch (e) {
    console.warn("HTTPS certs not found, dev server will use HTTP", e);
  }
  return false;
})();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: httpsOptions, // false ou { key, cert }
    proxy: {
      // Proxy /api/* to backend to avoid CORS in dev
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false // allow self-signed certs on backend dev
      }
      // ajouter d'autres proxys si nécessaire
    }
  }
});