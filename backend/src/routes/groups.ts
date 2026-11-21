import { Hono } from "hono";
import { CreateGroupSchema, JoinGroupSchema, generateInviteCode } from "@stepora/shared";

export const groupsRouter = new Hono();

/**
 * List user's groups
 */
groupsRouter.get("/", (c) => {
  return c.json({
    success: true,
    data: [],
    meta: { total: 0 },
  });
});

/**
 * Create new group
 */
groupsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = CreateGroupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid group creation payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  const inviteCode = generateInviteCode("STP", 4);

  return c.json({
    success: true,
    data: {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      description: parsed.data.description,
      inviteCode,
      dailyTarget: parsed.data.dailyTarget,
      durationDays: parsed.data.challengeDurationDays,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * Join group with invite code
 */
groupsRouter.post("/join", async (c) => {
  const body = await c.req.json();
  const parsed = JoinGroupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid group invitation code",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  return c.json({
    success: true,
    data: {
      message: `Group join foundation endpoint ready for code: ${parsed.data.inviteCode}`,
    },
  });
});
