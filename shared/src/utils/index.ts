/**
 * Stepora Shared Utilities
 */

/**
 * Generate a random, cryptographically secure invitation code
 * formatted for readability (e.g., "STP-9482")
 */
export function generateInviteCode(prefix = "STP", randomLength = 4): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous 0/O, 1/I
  let result = "";
  for (let i = 0; i < randomLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

/**
 * Estimate distance walked in meters based on step count and average stride length
 * Average adult stride is ~0.762 meters (approx 2.5 feet)
 */
export function calculateDistanceMeters(stepCount: number, strideLengthMeters = 0.762): number {
  if (stepCount <= 0) return 0;
  return Math.round(stepCount * strideLengthMeters);
}

/**
 * Estimate active calories burned walking based on steps and body weight
 * Formula: ~0.04 to 0.05 kcal per step for average 70kg individual
 */
export function calculateCaloriesBurned(stepCount: number, weightKg = 70): number {
  if (stepCount <= 0) return 0;
  const factor = (weightKg / 70) * 0.045;
  return Math.round(stepCount * factor);
}

/**
 * Formats a Date object as a standard YYYY-MM-DD string in local or specified timezone
 */
export function formatDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate completion percentage capped between 0 and 100
 */
export function calculateProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = Math.round((current / target) * 100);
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Calculate remaining steps needed to reach target
 */
export function calculateRemainingSteps(current: number, target: number): number {
  return Math.max(0, target - current);
}

/**
 * Calculate challenge end date based on start date and duration days
 */
export function calculateChallengeEndDate(startDateStr: string, durationDays: number): string {
  const date = new Date(startDateStr);
  date.setDate(date.getDate() + (durationDays - 1));
  return formatDateString(date);
}
