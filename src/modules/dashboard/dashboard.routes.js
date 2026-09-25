import express from "express";

import {
  getDashboardController,
} from "./dashboard.controller.js";

import { requireAdminAuth } from "../../middleware/adminAuth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAdminAuth,
  getDashboardController
);

export default router;