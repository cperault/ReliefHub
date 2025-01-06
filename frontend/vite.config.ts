import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "./certs/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "./certs/localhost.pem")),
    },
    port: parseInt(process.env.BPORT || "3000", 10),
  },
});
