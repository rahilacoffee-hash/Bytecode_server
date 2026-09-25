/**
 * Normalize an email address consistently
 * before storing or querying it.
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Remove sensitive fields from an admin object
 * before sending it to the client.
 */
export function sanitizeAdmin(admin) {
  if (!admin) return null;

  const {
    passwordHash,
    ...safeAdmin
  } = admin;

  return safeAdmin;
}

/**
 * Return only the safe fields needed by the client.
 */
export function sanitizeClient(client) {
  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    companyName: client.companyName,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}

/**
 * Convert a session expiry date into cookie max-age
 * in milliseconds.
 */
export function getSessionMaxAge(expiresAt) {
  const expiresIn = new Date(expiresAt).getTime() - Date.now();

  return Math.max(0, expiresIn);
}

/**
 * Remove sensitive/internal session fields
 * before returning session information.
 */
export function sanitizeSession(session) {
  if (!session) return null;

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    lastUsedAt: session.lastUsedAt,
    createdAt: session.createdAt,
  };
}