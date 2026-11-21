import { serve } from "@hono/node-server";
import { app } from "./index";

const port = Number(process.env.PORT) || 8787;
const hostname = process.env.HOST || "127.0.0.1";

console.log(`Starting Stepora API server locally on http://${hostname}:${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
    hostname,
  },
  (info) => {
    console.log(`🚀 Stepora API is running on http://${hostname}:${info.port}`);
    console.log(`🩺 Health check: http://${hostname}:${info.port}/health`);
  }
);
