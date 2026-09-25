const CLIENT_SESSION_COOKIE = "bytecodee_client_session";
const ADMIN_SESSION_COOKIE = "bytecodee_admin_session";

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export function setClientSessionCookie(res, token, maxAge) {
  res.cookie(CLIENT_SESSION_COOKIE, token, {
    ...baseCookieOptions,
    maxAge,
  });
}

export function clearClientSessionCookie(res) {
  res.clearCookie(CLIENT_SESSION_COOKIE, baseCookieOptions);
}

export function getClientSessionToken(req) {
  return req.cookies?.[CLIENT_SESSION_COOKIE] || null;
}

export function setAdminSessionCookie(res, token, maxAge) {
  res.cookie(ADMIN_SESSION_COOKIE, token, {
    ...baseCookieOptions,
    maxAge,
  });
}

export function clearAdminSessionCookie(res) {
  res.clearCookie(ADMIN_SESSION_COOKIE, baseCookieOptions);
}

export function getAdminSessionToken(req) {
  return req.cookies?.[ADMIN_SESSION_COOKIE] || null;
}