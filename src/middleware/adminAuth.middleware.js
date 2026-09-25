import { getAdminSession } from "../services/session.service.js";
import { getAdminSessionToken } from "../utils/cookies.js";
import { unauthorized } from "../utils/errors.js";

export async function requireAdminAuth(req, res, next) {
  try {
    const token = getAdminSessionToken(req);

    if (!token) {
      throw unauthorized(
        "Admin authentication required.",
        "ADMIN_AUTH_REQUIRED"
      );
    }

    const session = await getAdminSession(token);

    if (!session) {
      throw unauthorized(
        "Your admin session is invalid or has expired.",
        "INVALID_ADMIN_SESSION"
      );
    }

    req.admin = session.admin;
    req.adminSession = session;

    next();
  } catch (error) {
    next(error);
  }
}