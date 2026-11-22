import { Hono } from "hono";
import { SyncActivityBatchSchema } from "@stepora/shared";
import { ActivityService } from "../services/activityService";
import { AuthService } from "../services/authService";

export const activityRouter = new Hono();

/**
 * Idempotent Activity Synchronization Endpoint
 * Receives normalized step records from mobile (Health Connect / HealthKit)
 */
activityRouter.post("/sync", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_mobile_user";

  const body = await c.req.json();
  const parsed = SyncActivityBatchSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid step synchronization payload",
          details: parsed.error.errors,
        },
      },
      400
    );
  }

  const { deviceId, platform, records, syncBatchId } = parsed.data;
  const result = ActivityService.processSyncBatch(userId, records);

  return c.json({
    success: true,
    data: {
      batchId: syncBatchId || crypto.randomUUID(),
      deviceId,
      platform,
      receivedRecordsCount: records.length,
      acceptedCount: result.acceptedCount,
      duplicateCount: result.duplicateCount,
      milestoneUnlocked: result.milestoneUnlocked,
      todaySummary: result.todaySummary,
      syncedAt: new Date().toISOString(),
      message: `Synchronized ${result.acceptedCount} step records successfully.`,
    },
  });
});

/**
 * Daily activity query
 */
activityRouter.get("/daily", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_mobile_user";

  const date = c.req.query("date") || new Date().toISOString().slice(0, 10);
  const summary = ActivityService.getDailySummary(userId, date);

  return c.json({
    success: true,
    data: summary,
  });
});

/**
 * Historical activity query (e.g. last 7 or 30 days)
 */
activityRouter.get("/history", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = token ? await AuthService.validateSession(token) : null;
  const userId = user?.id || "guest_mobile_user";

  const days = Number(c.req.query("days") || "7") || 7;
  const history = ActivityService.getActivityHistory(userId, days);

  return c.json({
    success: true,
    data: history,
  });
});
