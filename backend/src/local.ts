import { serve } from "@hono/node-server";
import { app } from "./index";

const port = Number(process.env.PORT) || 8787;

console.log(`Starting Stepora API server locally on http://localhost:${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Stepora API is running on http://localhost:${info.port}`);
    console.log(`🩺 Health check: http://localhost:${info.port}/health`);
  }
);
