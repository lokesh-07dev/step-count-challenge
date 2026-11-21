import { Hono } from "hono";
import { CreateIndividualChallengeSchema } from "@stepora/shared";

export const challengesRouter = new Hono();

/**
 * List Individual Challenges
 */
challengesRouter.get("/", (c) => {
  return c.json({
    success: true,
    data: [],
    meta: { total: 0, message: "Individual challenges endpoint ready." },
  });
});

/**
 * Create Individual Challenge
 */
challengesRouter.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = CreateIndividualChallengeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid individual challenge payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  return c.json({
    success: true,
    data: {
      id: crypto.randomUUID(),
      ...parsed.data,
      status: "active",
      createdAt: new Date().toISOString(),
    },
  });
});
