import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./middleware/logger";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { activityRouter } from "./routes/activity";
import { challengesRouter } from "./routes/challenges";
import { groupsRouter } from "./routes/groups";

export const app = new Hono();

// Global Middlewares
app.use("*", requestLogger);
app.use("*", corsMiddleware());
app.onError(errorHandler);

// Health check routes
app.route("/health", healthRouter);
app.route("/api/v1/health", healthRouter);

// Domain API routes
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/activity", activityRouter);
app.route("/api/v1/individual-challenges", challengesRouter);
app.route("/api/v1/groups", groupsRouter);

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route not found: ${c.req.method} ${c.req.path}`,
      },
    },
    404
  );
});

// Cloudflare Workers entrypoint
export default app;
