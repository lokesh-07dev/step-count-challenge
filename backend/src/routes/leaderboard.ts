import { Hono } from "hono";
import { ChallengeService } from "../services/challengeService";
import { AuthService } from "../services/authService";

export const leaderboardRouter = new Hono();

/**
 * Global Step Leaderboard
 * GET /api/v1/leaderboard
 */
leaderboardRouter.get("/", async (c) => {
  const type = (c.req.query("type") === "daily" ? "daily" : "overall") as "daily" | "overall";
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;

  // Use global community challenge
  const entries = ChallengeService.getGroupLeaderboard(
    "00000000-0000-0000-0000-000000000001",
    type,
    user?.id
  );

  return c.json({
    success: true,
    data: entries,
    meta: {
      type,
      totalParticipants: entries.length,
      lastUpdated: new Date().toISOString(),
    },
  });
});
