import {
  getClientSession,
  getAdminSession,
} from "../services/session.service.js";

import {
  getClientSessionToken,
  getAdminSessionToken,
} from "../utils/cookies.js";

import { unauthorized } from "../utils/errors.js";

export async function requireAnyAuth(req, res, next) {
  try {
    const clientToken = getClientSessionToken(req);

    if (clientToken) {
      const clientSession =
        await getClientSession(clientToken);

      if (clientSession) {
        req.client = clientSession.client;
        req.clientSession = clientSession;
      }
    }

    const adminToken = getAdminSessionToken(req);

    if (adminToken) {
      const adminSession =
        await getAdminSession(adminToken);

      if (adminSession) {
        req.admin = adminSession.admin;
        req.adminSession = adminSession;
      }
    }

    // A browser can legitimately hold both session cookies. Preserve both
    // identities so shared routes grant the broader admin access rather than
    // treating an admin request as a client-only request.
    if (req.client?.id || req.admin?.id) {
      return next();
    }

    throw unauthorized(
      "Authentication required.",
      "AUTH_REQUIRED"
    );
  } catch (error) {
    next(error);
  }
}