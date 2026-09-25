import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a bcrypt hash.
 */
export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Generate a cryptographically secure session token.
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token before storing it in the database.
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a secure 6-digit OTP.
 */
export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP before storing it in the database.
 */
export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}