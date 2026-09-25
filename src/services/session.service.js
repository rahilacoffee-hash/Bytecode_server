import prisma from "../config/prisma.js";
import {
  generateSessionToken,
  hashToken,
} from "../utils/hash.js";
import { addDays } from "../utils/time.js";

/*
|--------------------------------------------------------------------------
| Session configuration
|--------------------------------------------------------------------------
*/

const CLIENT_SESSION_DAYS = 30;
const ADMIN_SESSION_DAYS = 7;

/*
|--------------------------------------------------------------------------
| Client Sessions
|--------------------------------------------------------------------------
*/

/**
 * Create a new client session.
 *
 * The raw token is returned to the caller so it can be
 * placed inside an HttpOnly cookie.
 *
 * Only the hashed token is stored in the database.
 */
export async function createClientSession(clientId) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);

  const expiresAt = addDays(CLIENT_SESSION_DAYS);

  const session = await prisma.clientSession.create({
    data: {
      clientId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    session,
    token,
    expiresAt,
  };
}

/**
 * Find a valid client session using the raw cookie token.
 */
export async function getClientSession(token) {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prisma.clientSession.findUnique({
    where: {
      tokenHash,
    },
    include: {
      client: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.revokedAt) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  await prisma.clientSession.update({
    where: {
      id: session.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return session;
}

/**
 * Revoke one client session.
 */
export async function revokeClientSession(token) {
  if (!token) {
    return;
  }

  const tokenHash = hashToken(token);

  await prisma.clientSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Revoke every session belonging to a client.
 *
 * Useful when:
 * - password/security changes
 * - account compromise
 * - user requests logout everywhere
 */
export async function revokeAllClientSessions(clientId) {
  await prisma.clientSession.updateMany({
    where: {
      clientId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/*
|--------------------------------------------------------------------------
| Admin Sessions
|--------------------------------------------------------------------------
*/

/**
 * Create a new admin session.
 */
export async function createAdminSession(adminId) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);

  const expiresAt = addDays(ADMIN_SESSION_DAYS);

  const session = await prisma.adminSession.create({
    data: {
      adminId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    session,
    token,
    expiresAt,
  };
}

/**
 * Find a valid admin session using the raw cookie token.
 */
export async function getAdminSession(token) {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash,
    },
    include: {
      admin: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.revokedAt) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  await prisma.adminSession.update({
    where: {
      id: session.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return session;
}

/**
 * Revoke one admin session.
 */
export async function revokeAdminSession(token) {
  if (!token) {
    return;
  }

  const tokenHash = hashToken(token);

  await prisma.adminSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Revoke every session belonging to an admin.
 */
export async function revokeAllAdminSessions(adminId) {
  await prisma.adminSession.updateMany({
    where: {
      adminId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}