import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors.js";

export function errorMiddleware(err, req, res, next) {
  console.error("❌ API Error:", err);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "The request is too large. Reduce the uploaded image sizes and try again.",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  /*
   * Custom application errors
   */
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  /*
   * Prisma errors
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A record with this value already exists.",
        code: "DUPLICATE_RECORD",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "The requested record was not found.",
        code: "NOT_FOUND",
      });
    }
  }

  /*
   * Invalid JSON
   */
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload.",
      code: "INVALID_JSON",
    });
  }

  /*
   * Unknown error
   */
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
    code: "INTERNAL_ERROR",
  });
}