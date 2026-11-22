import { Hono } from "hono";
import { CreateIndividualChallengeSchema } from "@stepora/shared";
import { ChallengeService } from "../services/challengeService";
import { AuthService } from "../services/authService";

export const challengesRouter = new Hono();

/**
 * List Individual Challenges for current user
 * GET /api/v1/individual-challenges
 */
challengesRouter.get("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_user";

  const challenges = ChallengeService.getUserIndividualChallenges(userId);

  return c.json({
    success: true,
    data: challenges,
    meta: { total: challenges.length },
  });
});

/**
 * Create Individual Challenge
 * POST /api/v1/individual-challenges
 */
challengesRouter.post("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_user";

  const body = await c.req.json();
  const parsed = CreateIndividualChallengeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.errors[0]?.message || "Invalid individual challenge payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  const created = ChallengeService.createIndividualChallenge({
    creatorId: userId,
    ...parsed.data,
  });

  return c.json({
    success: true,
    data: created,
  });
});
