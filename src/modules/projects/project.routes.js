import express from "express";

import {
  createProjectController,
  getClientProjectsController,
  getAllProjectsController,
  getProjectByIdController,
  updateProjectController,
} from "./project.controller.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation.js";

import { validate } from "../../middleware/validate.middleware.js";

import { requireClientAuth } from "../../middleware/clientAuth.middleware.js";
import { requireAdminAuth } from "../../middleware/adminAuth.middleware.js";
import { requireAnyAuth } from "../../middleware/anyAuth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Client routes
|--------------------------------------------------------------------------
*/

// Get all projects belonging to the authenticated client
router.get(
  "/me",
  requireClientAuth,
  getClientProjectsController
);

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/

// Create a project
router.post(
  "/",
  requireAdminAuth,
  validate(createProjectSchema),
  createProjectController
);

// Get all projects
router.get(
  "/",
  requireAdminAuth,
  getAllProjectsController
);

// Update a project
router.patch(
  "/:projectId",
  requireAdminAuth,
  validate(updateProjectSchema),
  updateProjectController
);

/*
|--------------------------------------------------------------------------
| Shared project lookup
|--------------------------------------------------------------------------
*/

// Client can only access their own project.
// Admin can access any project.
router.get(
  "/:projectId",
  requireAnyAuth,
  getProjectByIdController
);

export default router;