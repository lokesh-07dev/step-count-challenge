import { Hono } from "hono";
import { APP_NAME } from "@stepora/shared";

export const healthRouter = new Hono();

healthRouter.get("/", (c) => {
  return c.json({
    status: "ok",
    app: APP_NAME,
    service: "stepora-api",
    version: "1.0.0",
    environment: process.env.ENVIRONMENT || "development",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
  });
});
