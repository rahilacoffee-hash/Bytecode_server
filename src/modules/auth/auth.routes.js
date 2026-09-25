import express from "express";

import {
  registerClientController,
  requestClientRecoveryController,
  verifyClientRecoveryController,
  getCurrentClientController,
  getClientSessionController,
  updateClientProfileController,
  logoutClientController,

  registerAdminController,
  verifyAdminRegistrationController,
  loginAdminController,
  getCurrentAdminController,
  getAdminSessionController,
  logoutAdminController,
} from "./auth.controller.js";

import {
  clientRegisterSchema,
  clientRecoveryRequestSchema,
  clientRecoveryVerifySchema,
  adminRegisterSchema,
  adminVerifyOtpSchema,
  adminLoginSchema,
} from "./auth.validation.js";

import { validate } from "../../middleware/validate.middleware.js";

import { requireClientAuth } from "../../middleware/clientAuth.middleware.js";
import { requireAdminAuth } from "../../middleware/adminAuth.middleware.js";

import {
  authRateLimiter,
  otpRateLimiter,
} from "../../middleware/rateLimiter.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CLIENT AUTH
|--------------------------------------------------------------------------
*/

/**
 * Register client
 *
 * POST /api/v1/auth/client/register
 */
router.post(
  "/client/register",
  authRateLimiter,
  validate(clientRegisterSchema),
  registerClientController
);


/**
 * Request client account recovery OTP
 *
 * POST /api/v1/auth/client/recovery/request
 */
router.post(
  "/client/recovery/request",
  otpRateLimiter,
  validate(clientRecoveryRequestSchema),
  requestClientRecoveryController
);


/**
 * Verify client recovery OTP
 *
 * POST /api/v1/auth/client/recovery/verify
 */
router.post(
  "/client/recovery/verify",
  authRateLimiter,
  validate(clientRecoveryVerifySchema),
  verifyClientRecoveryController
);


/**
 * Get current authenticated client
 *
 * GET /api/v1/auth/client/me
 */
router.get(
  "/client/me",
  requireClientAuth,
  getCurrentClientController
);


/**
 * Get current client session
 *
 * GET /api/v1/auth/client/session
 */
router.get(
  "/client/session",
  requireClientAuth,
  getClientSessionController
);


/**
 * Update client profile
 *
 * PATCH /api/v1/auth/client/me
 */
router.patch(
  "/client/me",
  requireClientAuth,
  validate(clientRegisterSchema.partial()),
  updateClientProfileController
);


/**
 * Logout client
 *
 * POST /api/v1/auth/client/logout
 */
router.post(
  "/client/logout",
  requireClientAuth,
  logoutClientController
);


/*
|--------------------------------------------------------------------------
| ADMIN AUTH
|--------------------------------------------------------------------------
*/

/**
 * Register admin
 *
 * POST /api/v1/auth/admin/register
 */
router.post(
  "/admin/register",
  authRateLimiter,
  otpRateLimiter,
  validate(adminRegisterSchema),
  registerAdminController
);


/**
 * Verify admin registration OTP
 *
 * POST /api/v1/auth/admin/verify-otp
 */
router.post(
  "/admin/verify-otp",
  authRateLimiter,
  validate(adminVerifyOtpSchema),
  verifyAdminRegistrationController
);


/**
 * Admin login
 *
 * POST /api/v1/auth/admin/login
 */
router.post(
  "/admin/login",
  authRateLimiter,
  validate(adminLoginSchema),
  loginAdminController
);


/**
 * Get current authenticated admin
 *
 * GET /api/v1/auth/admin/me
 */
router.get(
  "/admin/me",
  requireAdminAuth,
  getCurrentAdminController
);


/**
 * Get current admin session
 *
 * GET /api/v1/auth/admin/session
 */
router.get(
  "/admin/session",
  requireAdminAuth,
  getAdminSessionController
);


/**
 * Logout admin
 *
 * POST /api/v1/auth/admin/logout
 */
router.post(
  "/admin/logout",
  requireAdminAuth,
  logoutAdminController
);

export default router;