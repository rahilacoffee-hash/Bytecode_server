import { getClientSession } from "../services/session.service.js";
import { getClientSessionToken } from "../utils/cookies.js";
import { unauthorized } from "../utils/errors.js";

export async function requireClientAuth(req, res, next) {
  try {
    const token = getClientSessionToken(req);

    if (!token) {
      throw unauthorized(
        "Authentication required.",
        "CLIENT_AUTH_REQUIRED"
      );
    }

    const session = await getClientSession(token);

    if (!session) {
      throw unauthorized(
        "Your client session is invalid or has expired.",
        "INVALID_CLIENT_SESSION"
      );
    }

    req.client = session.client;
    req.clientSession = session;

    next();
  } catch (error) {
    next(error);
  }
}