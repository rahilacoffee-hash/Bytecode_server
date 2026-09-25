import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "BYTECODEE API and database are connected",
      database: "PostgreSQL",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default router;