import crypto from "node:crypto";

/**
 * Hash password securely using PBKDF2 (100,000 iterations, SHA-512)
 * Formats output as `<salt_hex>:<hash_hex>`
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verify plaintext password against stored `<salt_hex>:<hash_hex>`
 */
export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, originalHash] = combinedHash.split(":");
    if (!salt || !originalHash) return resolve(false);

    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
        const originalBuffer = Buffer.from(originalHash, "hex");
        if (keyBuffer.length !== originalBuffer.length) return resolve(false);
        resolve(crypto.timingSafeEqual(keyBuffer, originalBuffer));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Generates a cryptographically secure session token (64 hex characters)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
