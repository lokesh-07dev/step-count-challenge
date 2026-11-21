import { Hono } from "hono";
import { SyncActivityBatchSchema } from "@stepora/shared";

export const activityRouter = new Hono();

/**
 * Idempotent Activity Synchronization Endpoint
 * Receives normalized step records from mobile (Health Connect / HealthKit)
 */
activityRouter.post("/sync", async (c) => {
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

  // Foundation response: validates shape and acknowledges received records
  return c.json({
    success: true,
    data: {
      batchId: syncBatchId || crypto.randomUUID(),
      deviceId,
      platform,
      receivedRecordsCount: records.length,
      acceptedCount: records.length,
      syncedAt: new Date().toISOString(),
      message: "Activity synchronization endpoint validated successfully.",
    },
  });
});

/**
 * Daily activity query
 */
activityRouter.get("/daily", (c) => {
  const date = c.req.query("date") || new Date().toISOString().split("T")[0];
  return c.json({
    success: true,
    data: {
      date,
      stepCount: 0,
      activeMinutes: 0,
      distanceMeters: 0,
      caloriesBurned: 0,
      lastSyncedAt: null,
    },
  });
});
