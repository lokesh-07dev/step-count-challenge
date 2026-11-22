import { Hono } from "hono";
import { CreateGroupSchema, JoinGroupSchema, LeaderboardQuerySchema } from "@stepora/shared";
import { ChallengeService } from "../services/challengeService";
import { AuthService } from "../services/authService";

export const groupsRouter = new Hono();

/**
 * List user's groups
 * GET /api/v1/groups
 */
groupsRouter.get("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_user";

  const groups = ChallengeService.getUserGroups(userId);

  return c.json({
    success: true,
    data: groups,
    meta: { total: groups.length },
  });
});

/**
 * Create new group
 * POST /api/v1/groups
 */
groupsRouter.post("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_user";
  const userName = user?.name || "Participant";

  const body = await c.req.json();
  const parsed = CreateGroupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.errors[0]?.message || "Invalid group creation payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  const group = ChallengeService.createGroup({
    creatorId: userId,
    creatorName: userName,
    ...parsed.data,
  });

  return c.json({
    success: true,
    data: {
      id: group.id,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      dailyTarget: group.dailyTarget,
      durationDays: group.durationDays,
      memberCount: group.members.size,
      startDate: group.startDate,
      endDate: group.endDate,
    },
  });
});

/**
 * Join group with invite code
 * POST /api/v1/groups/join
 */
groupsRouter.post("/join", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || crypto.randomUUID();
  const userName = user?.name || "New Participant";

  const body = await c.req.json();
  const parsed = JoinGroupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.errors[0]?.message || "Invalid group invitation code",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  try {
    const group = ChallengeService.joinGroupByCode(userId, userName, parsed.data.inviteCode);
    return c.json({
      success: true,
      data: {
        message: `Successfully joined ${group.name}!`,
        group: {
          id: group.id,
          name: group.name,
          inviteCode: group.inviteCode,
          memberCount: group.members.size,
          dailyTarget: group.dailyTarget,
        },
      },
    });
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: {
          code: "JOIN_FAILED",
          message: err.message || "Could not join group.",
        },
      },
      400
    );
  }
});

/**
 * Get Leaderboard for a group (Daily or Overall)
 * GET /api/v1/groups/:id/leaderboard
 */
groupsRouter.get("/:id/leaderboard", async (c) => {
  const groupId = c.req.param("id");
  const type = (c.req.query("type") === "daily" ? "daily" : "overall") as "daily" | "overall";

  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;

  const leaderboard = ChallengeService.getGroupLeaderboard(groupId, type, user?.id);

  return c.json({
    success: true,
    data: leaderboard,
    meta: {
      groupId,
      type,
      totalParticipants: leaderboard.length,
    },
  });
});
