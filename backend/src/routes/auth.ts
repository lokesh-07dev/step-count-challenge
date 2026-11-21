import { Hono } from "hono";
import { SignUpSchema, SignInSchema } from "@stepora/shared";

export const authRouter = new Hono();

/**
 * User Registration Foundation Endpoint
 */
authRouter.post("/sign-up", async (c) => {
  const body = await c.req.json();
  const parsed = SignUpSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid registration payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  // Placeholder for Better Auth hook / database persistence in Phase 2
  return c.json({
    success: true,
    data: {
      message: "Registration endpoint ready. Database integration in Phase 2.",
      user: {
        name: parsed.data.name,
        email: parsed.data.email,
        timezone: parsed.data.timezone,
      },
    },
  });
});

/**
 * User Sign-In Foundation Endpoint
 */
authRouter.post("/sign-in", async (c) => {
  const body = await c.req.json();
  const parsed = SignInSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid sign-in payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  return c.json({
    success: true,
    data: {
      message: "Sign-in endpoint ready. Authentication validation in Phase 2.",
    },
  });
});

/**
 * Current User Session Endpoint
 */
authRouter.get("/session", (c) => {
  return c.json({
    success: true,
    data: {
      authenticated: false,
      user: null,
    },
  });
});
