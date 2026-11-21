import type { ErrorHandler } from "hono";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[API Error] ${c.req.method} ${c.req.url}:`, err);

  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: err.errors,
        },
      },
      400
    );
  }

  const status = "status" in err && typeof err.status === "number" ? err.status : 500;
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred",
      },
    },
    status as any
  );
};
