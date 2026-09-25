import express from "express";
import { requireAdminAuth } from "../../middleware/adminAuth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  getHomepageController,
  updateHomepageController,
} from "./homepage.controller.js";
import { updateHomepageSchema } from "./homepage.validation.js";

const router = express.Router();

router.get("/", getHomepageController);
router.put("/", requireAdminAuth, validate(updateHomepageSchema), updateHomepageController);

export default router;
