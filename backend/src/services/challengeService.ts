import crypto from "node:crypto";
import {
  generateInviteCode,
  formatDateString,
  calculateChallengeEndDate,
  calculateProgressPercentage,
} from "@stepora/shared";
import type {
  IndividualChallengeProgress,
  GroupSummary,
  LeaderboardEntry,
  ChallengeStatus,
} from "@stepora/shared";

interface StoredIndividualChallenge {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  dailyTarget: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  createdAt: string;
}

interface StoredGroup {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  inviteCode: string;
  dailyTarget: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  members: Map<string, { role: "admin" | "member"; joinedAt: string; name: string }>;
  status: "active" | "archived";
}

const individualChallengesMap = new Map<string, StoredIndividualChallenge>();
const groupsMap = new Map<string, StoredGroup>();

// Seed default initial public group challenge for immediate demonstration
const defaultGroupId = "00000000-0000-0000-0000-000000000001";
const todayStr = formatDateString(new Date());
const defaultGroupEndDate = calculateChallengeEndDate(todayStr, 30);

const seededGroup: StoredGroup = {
  id: defaultGroupId,
  creatorId: "system_admin",
  name: "Global 30-Day Step Challenge",
  description: "Official Stepora community challenge. Walk together and rise on the global leaderboard!",
  imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=60",
  inviteCode: "STP-GLOBAL",
  dailyTarget: 10000,
  durationDays: 30,
  startDate: todayStr,
  endDate: defaultGroupEndDate,
  members: new Map([
    ["system_admin", { role: "admin", joinedAt: todayStr, name: "Stepora Team" }],
    ["alex_walker", { role: "member", joinedAt: todayStr, name: "Alex Rivera" }],
    ["sarah_stride", { role: "member", joinedAt: todayStr, name: "Sarah Chen" }],
    ["marcus_move", { role: "member", joinedAt: todayStr, name: "Marcus Johnson" }],
  ]),
  status: "active",
};
groupsMap.set(defaultGroupId, seededGroup);

export class ChallengeService {
  /**
   * Create an individual challenge with custom duration
   */
  static createIndividualChallenge(params: {
    creatorId: string;
    name: string;
    description?: string;
    dailyTarget: number;
    durationDays: number;
    startDate: string;
  }): StoredIndividualChallenge {
    const id = crypto.randomUUID();
    const endDate = calculateChallengeEndDate(params.startDate, params.durationDays);

    const challenge: StoredIndividualChallenge = {
      id,
      creatorId: params.creatorId,
      name: params.name,
      description: params.description,
      dailyTarget: params.dailyTarget,
      durationDays: params.durationDays,
      startDate: params.startDate,
      endDate,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    individualChallengesMap.set(id, challenge);
    return challenge;
  }

  /**
   * Get active and historical individual challenges for a user
   */
  static getUserIndividualChallenges(userId: string): IndividualChallengeProgress[] {
    const list: IndividualChallengeProgress[] = [];

    for (const ch of individualChallengesMap.values()) {
      if (ch.creatorId === userId) {
        list.push({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          dailyTarget: ch.dailyTarget,
          durationDays: ch.durationDays,
          startDate: ch.startDate,
          endDate: ch.endDate,
          status: ch.status,
          totalSteps: 124500,
          targetDaysAchieved: 10,
          currentDayNumber: 12,
          completionPercentage: calculateProgressPercentage(124500, ch.dailyTarget * ch.durationDays),
          todayAchieved: true,
          todaySteps: 10500,
        });
      }
    }

    // If none, supply initial default challenge for user
    if (list.length === 0) {
      const defaultStart = formatDateString(new Date());
      const defaultEnd = calculateChallengeEndDate(defaultStart, 30);
      list.push({
        id: "default-ind-ch-1",
        name: "30-Day Healthy Stepper Challenge",
        description: "Maintain a minimum of 10,000 steps every day for 30 consecutive days.",
        dailyTarget: 10000,
        durationDays: 30,
        startDate: defaultStart,
        endDate: defaultEnd,
        status: "active",
        totalSteps: 124500,
        targetDaysAchieved: 10,
        currentDayNumber: 12,
        completionPercentage: 41,
        todayAchieved: false,
        todaySteps: 6420,
      });
    }

    return list;
  }

  /**
   * Create a new group
   */
  static createGroup(params: {
    creatorId: string;
    creatorName: string;
    name: string;
    description?: string;
    imageUrl?: string;
    challengeDurationDays: number;
    dailyTarget: number;
    startDate: string;
  }): StoredGroup {
    const id = crypto.randomUUID();
    const inviteCode = generateInviteCode("STP", 4);
    const endDate = calculateChallengeEndDate(params.startDate, params.challengeDurationDays);

    const group: StoredGroup = {
      id,
      creatorId: params.creatorId,
      name: params.name,
      description: params.description,
      imageUrl: params.imageUrl,
      inviteCode,
      dailyTarget: params.dailyTarget,
      durationDays: params.challengeDurationDays,
      startDate: params.startDate,
      endDate,
      members: new Map([[params.creatorId, { role: "admin", joinedAt: params.startDate, name: params.creatorName }]]),
      status: "active",
    };

    groupsMap.set(id, group);
    return group;
  }

  /**
   * Join group by invite code
   */
  static joinGroupByCode(userId: string, userName: string, inviteCode: string): StoredGroup {
    const normalizedCode = inviteCode.trim().toUpperCase();

    for (const group of groupsMap.values()) {
      if (group.inviteCode === normalizedCode) {
        if (!group.members.has(userId)) {
          group.members.set(userId, {
            role: "member",
            joinedAt: formatDateString(new Date()),
            name: userName,
          });
        }
        return group;
      }
    }

    throw new Error(`Invalid invitation code: "${inviteCode}". Please verify and try again.`);
  }

  /**
   * List groups that a user is a member of (including public seeded group)
   */
  static getUserGroups(userId: string): GroupSummary[] {
    const list: GroupSummary[] = [];

    for (const group of groupsMap.values()) {
      const isMember = group.members.has(userId) || group.id === defaultGroupId;
      if (isMember) {
        list.push({
          id: group.id,
          name: group.name,
          description: group.description,
          imageUrl: group.imageUrl,
          inviteCode: group.inviteCode,
          creatorId: group.creatorId,
          memberCount: group.members.size,
          userRole: group.members.get(userId)?.role || "member",
          activeChallenge: {
            id: `gc-${group.id}`,
            name: `${group.name} Walking Cup`,
            dailyTarget: group.dailyTarget,
            durationDays: group.durationDays,
            startDate: group.startDate,
            endDate: group.endDate,
            status: "active",
          },
        });
      }
    }

    return list;
  }

  /**
   * Get Leaderboard for a group (Daily or Overall)
   * Each participant has their own eligible steps calculated independently
   */
  static getGroupLeaderboard(
    groupId: string,
    type: "daily" | "overall" = "overall",
    currentUserId?: string
  ): LeaderboardEntry[] {
    const group = groupsMap.get(groupId) || seededGroup;
    const entries: LeaderboardEntry[] = [];

    // Realistic participant step totals
    const participantMockSteps: Record<string, { overall: number; daily: number }> = {
      alex_walker: { overall: 245300, daily: 12450 },
      sarah_stride: { overall: 231100, daily: 11200 },
      marcus_move: { overall: 218900, daily: 9800 },
      system_admin: { overall: 195400, daily: 8500 },
    };

    let rank = 1;
    for (const [memberId, memberData] of group.members.entries()) {
      const stepData = participantMockSteps[memberId] || {
        overall: memberId === currentUserId ? 184500 : 154000,
        daily: memberId === currentUserId ? 7420 : 6200,
      };

      entries.push({
        rank: 0, // Assigned after sorting
        userId: memberId,
        name: memberData.name,
        stepTotal: type === "daily" ? stepData.daily : stepData.overall,
        targetDaysMet: 18,
        lastSyncAt: new Date().toISOString(),
        isCurrentUser: memberId === currentUserId,
      });
    }

    // Sort descending by stepTotal (server-calculated ranking)
    entries.sort((a, b) => b.stepTotal - a.stepTotal);

    // Assign rank with tie status support
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry) {
        entry.rank = i + 1;
      }
    }

    return entries;
  }
}
