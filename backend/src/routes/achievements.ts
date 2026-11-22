import { Hono } from "hono";
import type { AchievementBadge } from "@stepora/shared";

export const achievementsRouter = new Hono();

const SYSTEM_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: "ach-1",
    code: "FIRST_1000",
    title: "First 1,000 Steps",
    description: "Crossed your first 1,000 physical steps in a day.",
    iconName: "Sparkles",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "ach-2",
    code: "GOAL_CRUSHER_10K",
    title: "10,000 Steps Reached",
    description: "Achieved the recommended 10,000 steps daily fitness target.",
    iconName: "Trophy",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "ach-3",
    code: "CONSISTENCY_7",
    title: "7-Day Stride Streak",
    description: "Achieved your daily walking target 7 days in a row.",
    iconName: "Flame",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "ach-4",
    code: "COMMUNITY_CHAMPION",
    title: "Group Challenger",
    description: "Joined a group step challenge with friends.",
    iconName: "Users",
    unlockedAt: new Date().toISOString(),
  },
];

achievementsRouter.get("/", (c) => {
  return c.json({
    success: true,
    data: SYSTEM_ACHIEVEMENTS,
  });
});
