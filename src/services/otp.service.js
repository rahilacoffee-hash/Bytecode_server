import prisma from "../config/prisma.js";

import {
  generateOtp,
  hashOtp,
} from "../utils/hash.js";

import { addMinutes } from "../utils/time.js";

import {
  badRequest,
  unauthorized,
} from "../utils/errors.js";


const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;


/*
|--------------------------------------------------------------------------
| INTERNAL HELPERS
|--------------------------------------------------------------------------
*/

async function invalidateActiveOtps(email) {
  await prisma.clientOtpChallenge.updateMany({
    where: {
      email,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      consumedAt: new Date(),
    },
  });

  await prisma.adminOtpChallenge.updateMany({
    where: {
      email,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      consumedAt: new Date(),
    },
  });
}


/*
|--------------------------------------------------------------------------
| CLIENT OTP
|--------------------------------------------------------------------------
*/

/**
 * Create a new client OTP.
 */
export async function createClientOtp({
  email,
  clientId = null,
}) {
  await invalidateActiveOtps(email);

  const otp = generateOtp();
  const codeHash = hashOtp(otp);
  const expiresAt = addMinutes(
    OTP_EXPIRY_MINUTES
  );

  const challenge =
    await prisma.clientOtpChallenge.create({
      data: {
        email,
        clientId,
        codeHash,
        expiresAt,
      },
    });

  return {
    otp,
    expiresAt: challenge.expiresAt,
  };
}


/**
 * Verify a client OTP.
 */
export async function verifyClientOtp({
  email,
  otp,
}) {
  const challenge =
    await prisma.clientOtpChallenge.findFirst({
      where: {
        email,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!challenge) {
    throw unauthorized(
      "Invalid or expired verification code.",
      "INVALID_OTP"
    );
  }

  if (
    challenge.expiresAt <= new Date()
  ) {
    throw unauthorized(
      "This verification code has expired.",
      "OTP_EXPIRED"
    );
  }

  if (
    challenge.attempts >=
    MAX_OTP_ATTEMPTS
  ) {
    throw unauthorized(
      "Too many incorrect attempts. Please request a new code.",
      "OTP_ATTEMPTS_EXCEEDED"
    );
  }

  const incomingHash = hashOtp(otp);

  if (
    incomingHash !== challenge.codeHash
  ) {
    await prisma.clientOtpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw unauthorized(
      "Invalid verification code.",
      "INVALID_OTP"
    );
  }

  await prisma.clientOtpChallenge.update({
    where: {
      id: challenge.id,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  return true;
}


/*
|--------------------------------------------------------------------------
| ADMIN OTP
|--------------------------------------------------------------------------
*/

/**
 * Create a new admin OTP.
 */
export async function createAdminOtp({
  email,
  adminId = null,
}) {
  await invalidateActiveOtps(email);

  const otp = generateOtp();
  const codeHash = hashOtp(otp);
  const expiresAt = addMinutes(
    OTP_EXPIRY_MINUTES
  );

  const challenge =
    await prisma.adminOtpChallenge.create({
      data: {
        email,
        adminId,
        codeHash,
        expiresAt,
      },
    });

  return {
    otp,
    expiresAt: challenge.expiresAt,
  };
}


/**
 * Verify an admin OTP.
 */
export async function verifyAdminOtp({
  email,
  otp,
}) {
  const challenge =
    await prisma.adminOtpChallenge.findFirst({
      where: {
        email,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!challenge) {
    throw unauthorized(
      "Invalid or expired verification code.",
      "INVALID_OTP"
    );
  }

  if (
    challenge.expiresAt <= new Date()
  ) {
    throw unauthorized(
      "This verification code has expired.",
      "OTP_EXPIRED"
    );
  }

  if (
    challenge.attempts >=
    MAX_OTP_ATTEMPTS
  ) {
    throw unauthorized(
      "Too many incorrect attempts. Please request a new code.",
      "OTP_ATTEMPTS_EXCEEDED"
    );
  }

  const incomingHash = hashOtp(otp);

  if (
    incomingHash !== challenge.codeHash
  ) {
    await prisma.adminOtpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw unauthorized(
      "Invalid verification code.",
      "INVALID_OTP"
    );
  }

  await prisma.adminOtpChallenge.update({
    where: {
      id: challenge.id,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  return true;
}