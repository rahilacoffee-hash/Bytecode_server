import express from "express";

import {
  createConversationController,
  getClientConversationsController,
  updateClientConversationController,
  getAllConversationsController,
  updateAdminConversationController,
  getConversationByIdController,
} from "./conversation.controller.js";

import {
  createConversationSchema,
  updateConversationSchema,
} from "./conversation.validation.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  requireClientAuth,
} from "../../middleware/clientAuth.middleware.js";

import {
  requireAdminAuth,
} from "../../middleware/adminAuth.middleware.js";

import {
  requireAnyAuth,
} from "../../middleware/anyAuth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Client routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireClientAuth,
  validate(createConversationSchema),
  createConversationController
);

router.get(
  "/me",
  requireClientAuth,
  getClientConversationsController
);

router.patch(
  "/:conversationId",
  requireClientAuth,
  validate(updateConversationSchema),
  updateClientConversationController
);

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAdminAuth,
  getAllConversationsController
);

router.patch(
  "/:conversationId/admin",
  requireAdminAuth,
  validate(updateConversationSchema),
  updateAdminConversationController
);

/*
|--------------------------------------------------------------------------
| Shared conversation lookup
|--------------------------------------------------------------------------
*/

router.get(
  "/:conversationId",
  requireAnyAuth,
  getConversationByIdController
);

export default router;