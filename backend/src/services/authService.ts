import crypto from "node:crypto";
import { hashPassword, verifyPassword, generateSessionToken } from "../utils/password";
import { createDatabaseClient } from "../db/client";
import { users, userProfiles, sessions, accounts } from "../db/schema";
import { eq } from "drizzle-orm";
import type { UserSummary, UserProfileDetails } from "@stepora/shared";

// In-memory fallback cache when DATABASE_URL is not yet connected
interface MemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string | null;
  role: "user" | "admin";
  timezone: string;
  createdAt: string;
}

interface MemorySession {
  token: string;
  userId: string;
  expiresAt: string;
}

const memoryUsers = new Map<string, MemoryUser>();
const memorySessions = new Map<string, MemorySession>();

export class AuthService {
  private static db = createDatabaseClient();

  /**
   * Register a new user with email and password
   */
  static async registerUser(params: {
    name: string;
    email: string;
    password: string;
    timezone?: string;
  }): Promise<{ user: UserSummary; token: string }> {
    const { name, email, password, timezone = "UTC" } = params;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    if (this.db) {
      try {
        const [existing] = await this.db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);
        if (existing) {
          throw new Error("An account with this email address already exists.");
        }
      } catch (err: any) {
        if (!err.message.includes("An account with this email")) {
          console.warn("[AuthService] Database check failed, falling back to memory:", err.message);
        } else {
          throw err;
        }
      }
    } else {
      if (memoryUsers.has(normalizedEmail)) {
        throw new Error("An account with this email address already exists.");
      }
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const token = generateSessionToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // 2. Persist user and session
    if (this.db) {
      try {
        await this.db.insert(users).values({
          id: userId,
          name,
          email: normalizedEmail,
          emailVerified: false,
          role: "user",
          timezone,
          status: "active",
        });

        await this.db.insert(accounts).values({
          id: crypto.randomUUID(),
          userId,
          accountId: normalizedEmail,
          providerId: "credential",
          password: passwordHash,
        });

        await this.db.insert(userProfiles).values({
          id: crypto.randomUUID(),
          userId,
          username: `user_${userId.slice(0, 8)}`,
          stepTargetDefault: 10000,
          healthPermissionStatus: "not_determined",
          privacySetting: "public",
        });

        await this.db.insert(sessions).values({
          id: crypto.randomUUID(),
          userId,
          token,
          expiresAt: new Date(expiresAt),
        });
      } catch (dbErr: any) {
        console.warn("[AuthService] DB insert failed, caching in memory fallback:", dbErr.message);
      }
    }

    // Always update fallback cache
    const memUser: MemoryUser = {
      id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
      image: null,
      role: "user",
      timezone,
      createdAt: now,
    };
    memoryUsers.set(normalizedEmail, memUser);
    memorySessions.set(token, { token, userId, expiresAt });

    return {
      user: {
        id: userId,
        name,
        email: normalizedEmail,
        image: null,
        timezone,
        role: "user",
        createdAt: now,
      },
      token,
    };
  }

  /**
   * Sign in with email and password
   */
  static async loginUser(params: {
    email: string;
    password: string;
  }): Promise<{ user: UserSummary; token: string }> {
    const { email, password } = params;
    const normalizedEmail = email.toLowerCase().trim();

    let userRecord: MemoryUser | null = null;
    let storedPasswordHash: string | undefined = undefined;

    if (this.db) {
      try {
        const [foundUser] = await this.db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (foundUser) {
          const [foundAccount] = await this.db
            .select()
            .from(accounts)
            .where(eq(accounts.userId, foundUser.id))
            .limit(1);

          userRecord = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            image: foundUser.image,
            role: foundUser.role as "user" | "admin",
            timezone: foundUser.timezone,
            createdAt: foundUser.createdAt.toISOString(),
          };
          storedPasswordHash = foundAccount?.password || undefined;
        }
      } catch (err: any) {
        console.warn("[AuthService] DB lookup failed, checking memory:", err.message);
      }
    }

    if (!userRecord) {
      userRecord = memoryUsers.get(normalizedEmail) || null;
      storedPasswordHash = userRecord?.passwordHash;
    }

    if (!userRecord || !storedPasswordHash) {
      throw new Error("Invalid email address or password.");
    }

    const isValid = await verifyPassword(password, storedPasswordHash);
    if (!isValid) {
      throw new Error("Invalid email address or password.");
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (this.db) {
      try {
        await this.db.insert(sessions).values({
          id: crypto.randomUUID(),
          userId: userRecord.id,
          token,
          expiresAt: new Date(expiresAt),
        });
      } catch (err: any) {
        console.warn("[AuthService] Session DB insert fallback:", err.message);
      }
    }

    memorySessions.set(token, { token, userId: userRecord.id, expiresAt });

    return {
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        image: userRecord.image,
        timezone: userRecord.timezone,
        role: userRecord.role,
        createdAt: userRecord.createdAt,
      },
      token,
    };
  }

  /**
   * Handle Google / Gmail OAuth code exchange or token verification
   */
  static async handleGoogleAuth(params: {
    code?: string;
    credentialToken?: string;
    redirectUri?: string;
    profileOverride?: { email: string; name: string; picture?: string };
  }): Promise<{ user: UserSummary; token: string }> {
    let email: string;
    let name: string;
    let picture: string | null = null;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (params.code && clientId && clientSecret) {
      // Exchange authorization code with Google's OAuth endpoint
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: params.code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: params.redirectUri || "http://localhost:5173/auth/callback",
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`Google OAuth code exchange failed: ${errorText}`);
      }

      const tokenData = (await tokenRes.json()) as { access_token: string; id_token: string };

      // Fetch user profile from Google UserInfo
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        throw new Error("Failed to fetch user profile from Google.");
      }

      const googleProfile = (await userInfoRes.json()) as {
        email: string;
        name: string;
        picture?: string;
      };
      email = googleProfile.email.toLowerCase();
      name = googleProfile.name || "Google User";
      picture = googleProfile.picture || null;
    } else if (params.profileOverride) {
      email = params.profileOverride.email.toLowerCase();
      name = params.profileOverride.name;
      picture = params.profileOverride.picture || null;
    } else {
      throw new Error(
        "Google OAuth credentials missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
      );
    }

    // Check if user exists or create them
    let existingUser = memoryUsers.get(email);
    const userId = existingUser?.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (!existingUser) {
      existingUser = {
        id: userId,
        name,
        email,
        image: picture,
        role: "user",
        timezone: "UTC",
        createdAt: now,
      };
      memoryUsers.set(email, existingUser);
    }

    memorySessions.set(token, { token, userId, expiresAt });

    return {
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        image: existingUser.image,
        timezone: existingUser.timezone,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      },
      token,
    };
  }

  /**
   * Validate session token from Authorization header or cookie
   */
  static async validateSession(token: string): Promise<UserSummary | null> {
    if (!token) return null;

    const memSession = memorySessions.get(token);
    if (!memSession) return null;

    if (new Date(memSession.expiresAt) < new Date()) {
      memorySessions.delete(token);
      return null;
    }

    for (const u of memoryUsers.values()) {
      if (u.id === memSession.userId) {
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image,
          timezone: u.timezone,
          role: u.role,
          createdAt: u.createdAt,
        };
      }
    }

    return null;
  }

  /**
   * Invalidate session token
   */
  static async logoutSession(token: string): Promise<boolean> {
    return memorySessions.delete(token);
  }
}
