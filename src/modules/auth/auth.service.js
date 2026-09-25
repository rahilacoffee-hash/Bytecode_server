import prisma from "../../config/prisma.js";
import { env } from "../../config/env.js";

import {
  createClientSession,
  getClientSession,
  revokeClientSession,
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
} from "../../services/session.service.js";

import {
  createClientOtp,
  verifyClientOtp,
  createAdminOtp,
  verifyAdminOtp,
} from "../../services/otp.service.js";

import { sendOtpEmail } from "../../services/email.service.js";

import {
  hashPassword,
  comparePassword,
} from "../../utils/hash.js";

import {
  setClientSessionCookie,
  clearClientSessionCookie,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "../../utils/cookies.js";

import {
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  notFound,
} from "../../utils/errors.js";

import {
  normalizeEmail,
  sanitizeClient,
  sanitizeAdmin,
  getSessionMaxAge,
  sanitizeSession,
} from "./auth.utils.js";

/*
|--------------------------------------------------------------------------
| CLIENT AUTH
|--------------------------------------------------------------------------
*/

/**
 * Register a new client.
 *
 * Registration automatically creates a client session.
 */
export async function registerClient({
  name,
  email,
  phone,
  companyName,
  res,
}) {
  const normalizedEmail = normalizeEmail(email);

  const existingClient = await prisma.client.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingClient) {
    throw conflict(
      "A client account with this email already exists.",
      "CLIENT_ALREADY_EXISTS"
    );
  }

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      companyName: companyName?.trim() || null,
    },
  });

  const { token, expiresAt } = await createClientSession(
    client.id
  );

  setClientSessionCookie(
    res,
    token,
    getSessionMaxAge(expiresAt)
  );

  return {
    client: sanitizeClient(client),
    session: {
      expiresAt,
    },
  };
}


/**
 * Get the currently authenticated client.
 */
export async function getCurrentClient(req) {
  if (!req.client) {
    throw unauthorized(
      "Authentication required.",
      "CLIENT_AUTH_REQUIRED"
    );
  }

  return sanitizeClient(req.client);
}


/**
 * Update the authenticated client's profile.
 */
export async function updateClientProfile({
  req,
  name,
  phone,
  companyName,
}) {
  if (!req.client?.id) {
    throw unauthorized(
      "Authentication required.",
      "CLIENT_AUTH_REQUIRED"
    );
  }

  const client = await prisma.client.update({
    where: {
      id: req.client.id,
    },
    data: {
      ...(name !== undefined && {
        name: name.trim(),
      }),

      ...(phone !== undefined && {
        phone: phone.trim() || null,
      }),

      ...(companyName !== undefined && {
        companyName: companyName.trim() || null,
      }),
    },
  });

  return sanitizeClient(client);
}


/**
 * Request client account recovery.
 *
 * This intentionally returns the same response whether
 * the email exists or not to avoid account enumeration.
 */
export async function requestClientRecovery({
  email,
}) {
  const normalizedEmail = normalizeEmail(email);

  const client = await prisma.client.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  /*
   * Do not reveal whether the account exists.
   */
  if (!client) {
    return {
      message:
        "If an account exists for this email, a verification code has been sent.",
    };
  }

  const { otp, expiresAt } = await createClientOtp({
    email: normalizedEmail,
    clientId: client.id,
  });

  await sendOtpEmail({
    to: normalizedEmail,
    otp,
    purpose: "client-recovery",
  });

  return {
    message:
      "If an account exists for this email, a verification code has been sent.",
    expiresAt,
  };
}


/**
 * Verify client recovery OTP and create a new session.
 */
export async function verifyClientRecovery({
  email,
  otp,
  res,
}) {
  const normalizedEmail = normalizeEmail(email);

  const client = await prisma.client.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  /*
   * Keep the response generic when the account does not exist.
   */
  if (!client) {
    throw unauthorized(
      "Invalid or expired verification code.",
      "INVALID_RECOVERY_CODE"
    );
  }

  await verifyClientOtp({
    email: normalizedEmail,
    otp,
  });

  const { token, expiresAt } = await createClientSession(
    client.id
  );

  setClientSessionCookie(
    res,
    token,
    getSessionMaxAge(expiresAt)
  );

  return {
    client: sanitizeClient(client),
    session: {
      expiresAt,
    },
  };
}


/**
 * Logout the current client session.
 */
export async function logoutClient({
  req,
  res,
}) {
  const cookieToken =
    req.cookies?.bytecodee_client_session;

  if (cookieToken) {
    await revokeClientSession(cookieToken);
  }

  clearClientSessionCookie(res);

  return {
    message: "Client logged out successfully.",
  };
}

/**
 * Get the current client session.
 */
export async function getClientSessionInfo(req) {
  if (!req.clientSession) {
    throw unauthorized(
      "Authentication required.",
      "CLIENT_AUTH_REQUIRED"
    );
  }

  return {
    client: sanitizeClient(req.client),
    session: sanitizeSession(req.clientSession),
  };
}


/*
|--------------------------------------------------------------------------
| ADMIN AUTH
|--------------------------------------------------------------------------
*/

/**
 * Register a new admin.
 *
 * Registration requires the private admin registration code.
 */
export async function registerAdmin({
  name,
  email,
  password,
  registrationCode,
}) {
  const normalizedEmail = normalizeEmail(email);

  if (
    registrationCode !==
    env.ADMIN_REGISTRATION_CODE
  ) {
    throw forbidden(
      "Invalid admin registration code.",
      "INVALID_ADMIN_REGISTRATION_CODE"
    );
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingAdmin) {
    throw conflict(
      "An admin account with this email already exists.",
      "ADMIN_ALREADY_EXISTS"
    );
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      name: name?.trim() || null,
      email: normalizedEmail,
      passwordHash,
    },
  });

  const { otp, expiresAt } = await createAdminOtp({
    email: normalizedEmail,
    adminId: admin.id,
  });

  await sendOtpEmail({
    to: normalizedEmail,
    otp,
    purpose: "admin-registration",
  });

  return {
    admin: sanitizeAdmin(admin),
    otpExpiresAt: expiresAt,
    message:
      "Admin account created. Please verify your email with the OTP sent to you.",
  };
}


/**
 * Verify admin registration OTP.
 */
export async function verifyAdminRegistration({
  email,
  otp,
}) {
  const normalizedEmail = normalizeEmail(email);

  const admin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin) {
    throw notFound(
      "Admin account not found.",
      "ADMIN_NOT_FOUND"
    );
  }

  if (admin.emailVerifiedAt) {
    return {
      admin: sanitizeAdmin(admin),
      message: "Admin email is already verified.",
    };
  }

  await verifyAdminOtp({
    email: normalizedEmail,
    otp,
  });

  const verifiedAdmin = await prisma.admin.update({
    where: {
      id: admin.id,
    },
    data: {
      emailVerifiedAt: new Date(),
    },
  });

  return {
    admin: sanitizeAdmin(verifiedAdmin),
    message: "Admin email verified successfully.",
  };
}


/**
 * Login admin.
 */
export async function loginAdmin({
  email,
  password,
  res,
}) {
  const normalizedEmail = normalizeEmail(email);

  const admin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin) {
    throw unauthorized(
      "Invalid email or password.",
      "INVALID_ADMIN_CREDENTIALS"
    );
  }

  const passwordValid = await comparePassword(
    password,
    admin.passwordHash
  );

  if (!passwordValid) {
    throw unauthorized(
      "Invalid email or password.",
      "INVALID_ADMIN_CREDENTIALS"
    );
  }

  if (!admin.emailVerifiedAt) {
    throw forbidden(
      "Please verify your admin email before logging in.",
      "ADMIN_EMAIL_NOT_VERIFIED"
    );
  }

  const { token, expiresAt } =
    await createAdminSession(admin.id);

  setAdminSessionCookie(
    res,
    token,
    getSessionMaxAge(expiresAt)
  );

  return {
    admin: sanitizeAdmin(admin),
    session: {
      expiresAt,
    },
  };
}


/**
 * Get currently authenticated admin.
 */
export async function getCurrentAdmin(req) {
  if (!req.admin) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  return sanitizeAdmin(req.admin);
}


/**
 * Get current admin session information.
 */
export async function getAdminSessionInfo(req) {
  if (!req.adminSession) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  return {
    admin: sanitizeAdmin(req.admin),
    session: sanitizeSession(req.adminSession),
  };
}


/**
 * Logout current admin.
 */
export async function logoutAdmin({
  req,
  res,
}) {
  const cookieToken =
    req.cookies?.bytecodee_admin_session;

  if (cookieToken) {
    await revokeAdminSession(cookieToken);
  }

  clearAdminSessionCookie(res);

  return {
    message: "Admin logged out successfully.",
  };
}