export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export function badRequest(message, code = "BAD_REQUEST") {
  return new AppError(message, 400, code);
}

export function unauthorized(
  message = "Authentication required",
  code = "UNAUTHORIZED"
) {
  return new AppError(message, 401, code);
}

export function forbidden(
  message = "You do not have permission to perform this action",
  code = "FORBIDDEN"
) {
  return new AppError(message, 403, code);
}

export function notFound(
  message = "Resource not found",
  code = "NOT_FOUND"
) {
  return new AppError(message, 404, code);
}

export function conflict(message, code = "CONFLICT") {
  return new AppError(message, 409, code);
}