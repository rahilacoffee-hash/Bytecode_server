import express from "express";
import { z } from "zod";

import {
  createQuoteController,
  getClientQuotesController,
  getAllQuotesController,
  getQuoteByIdController,
  updateQuoteController,
  decideClientQuoteController,
} from "./quote.controller.js";

import {
  createQuoteSchema,
  updateQuoteSchema,
} from "./quote.validation.js";

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

router.patch("/:quoteId/decision", requireClientAuth, validate(z.object({ status: z.enum(["ACCEPTED", "REJECTED"]) })), decideClientQuoteController);

// Get all quotes belonging to the logged-in client
router.get(
  "/me",
  requireClientAuth,
  getClientQuotesController
);

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/

// Create a quote
router.post(
  "/",
  requireAdminAuth,
  validate(createQuoteSchema),
  createQuoteController
);

// Get all quotes
router.get(
  "/",
  requireAdminAuth,
  getAllQuotesController
);

// Update a quote
router.patch(
  "/:quoteId",
  requireAdminAuth,
  validate(updateQuoteSchema),
  updateQuoteController
);

/*
|--------------------------------------------------------------------------
| Shared routes
|--------------------------------------------------------------------------
*/

// Get a specific quote
// Client can only access their own quote.
// Admin can access any quote.
router.get(
  "/:quoteId",
  requireAnyAuth,
  getQuoteByIdController
);

export default router;