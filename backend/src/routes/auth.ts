import { Hono } from "hono";
import { SignUpSchema, SignInSchema } from "@stepora/shared";
import { AuthService } from "../services/authService";

export const authRouter = new Hono();

/**
 * User Registration Endpoint
 * POST /api/v1/auth/sign-up
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
          message: parsed.error.errors[0]?.message || "Invalid registration payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  try {
    const result = await AuthService.registerUser(parsed.data);
    return c.json({
      success: true,
      data: {
        message: "Registration successful. Welcome to Stepora!",
        user: result.user,
        token: result.token,
      },
    });
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: {
          code: "REGISTRATION_FAILED",
          message: err.message || "Failed to create user account.",
        },
      },
      400
    );
  }
});

/**
 * User Sign-In Endpoint
 * POST /api/v1/auth/sign-in
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
          message: parsed.error.errors[0]?.message || "Invalid sign-in payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  try {
    const result = await AuthService.loginUser(parsed.data);
    return c.json({
      success: true,
      data: {
        message: "Login successful.",
        user: result.user,
        token: result.token,
      },
    });
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: err.message || "Invalid email address or password.",
        },
      },
      401
    );
  }
});

/**
 * Current User Session Endpoint
 * GET /api/v1/auth/session
 */
authRouter.get("/session", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({
      success: true,
      data: {
        authenticated: false,
        user: null,
      },
    });
  }

  const user = await AuthService.validateSession(token);
  if (!user) {
    return c.json({
      success: true,
      data: {
        authenticated: false,
        user: null,
      },
    });
  }

  return c.json({
    success: true,
    data: {
      authenticated: true,
      user,
    },
  });
});

/**
 * Sign-Out Endpoint
 * POST /api/v1/auth/sign-out
 */
authRouter.post("/sign-out", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    await AuthService.logoutSession(token);
  }
  return c.json({
    success: true,
    data: {
      message: "Successfully logged out.",
    },
  });
});

/**
 * Get Google OAuth Initiation URL
 * GET /api/v1/auth/google/url
 */
authRouter.get("/google/url", (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.req.query("redirectUri") || "http://localhost:5173/auth/callback";

  if (!clientId) {
    return c.json({
      success: true,
      data: {
        configured: false,
        message: "Google OAuth credentials not yet configured in .env. Use test mode or add credentials.",
      },
    });
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

  return c.json({
    success: true,
    data: {
      configured: true,
      url,
    },
  });
});

/**
 * Exchange Google OAuth Code
 * POST /api/v1/auth/google/callback
 */
authRouter.post("/google/callback", async (c) => {
  const body = await c.req.json();
  const { code, redirectUri, testProfile } = body;

  try {
    const result = await AuthService.handleGoogleAuth({
      code,
      redirectUri,
      profileOverride: testProfile,
    });
    return c.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: {
          code: "GOOGLE_AUTH_FAILED",
          message: err.message || "Failed to authenticate with Google.",
        },
      },
      400
    );
  }
});
