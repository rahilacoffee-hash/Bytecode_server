import { z } from "zod";

/*
 * Shared email validation.
 */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address.")
  .max(254, "Email address is too long.");

/*
 * Shared password validation.
 *
 * We keep the minimum at 8 characters.
 * Stronger password requirements can be added later.
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must not exceed 128 characters.");

/*
 * Shared OTP validation.
 */
const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a valid 6-digit code.");

/*
 * CLIENT
 */

/**
 * Client registration.
 *
 * POST /auth/client/register
 */
export const clientRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must not exceed 100 characters."),

  email: emailSchema,

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),

  companyName: z
    .string()
    .trim()
    .max(150, "Company name is too long.")
    .optional()
    .or(z.literal("")),
});

/**
 * Client recovery request.
 *
 * POST /auth/client/recovery/request
 */
export const clientRecoveryRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Client recovery verification.
 *
 * POST /auth/client/recovery/verify
 */
export const clientRecoveryVerifySchema = z.object({
  email: emailSchema,

  otp: otpSchema,
});

/*
 * ADMIN
 */

/**
 * Admin registration.
 *
 * POST /auth/admin/register
 */
export const adminRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must not exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  email: emailSchema,

  password: passwordSchema,

  registrationCode: z
    .string()
    .trim()
    .min(1, "Registration code is required.")
    .max(200, "Registration code is too long."),
});

/**
 * Admin OTP verification.
 *
 * POST /auth/admin/verify-otp
 */
export const adminVerifyOtpSchema = z.object({
  email: emailSchema,

  otp: otpSchema,
});

/**
 * Admin login.
 *
 * POST /auth/admin/login
 */
export const adminLoginSchema = z.object({
  email: emailSchema,

  password: passwordSchema,
});