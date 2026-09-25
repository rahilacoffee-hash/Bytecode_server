import express from "express";

import {
  sendClientMessageController,
  sendAdminMessageController,
  getClientMessagesController,
  getAdminMessagesController,
  markClientMessagesReadController,
  markAdminMessagesReadController,
} from "./message.controller.js";

import { sendMessageSchema } from "./message.validation.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  requireClientAuth,
} from "../../middleware/clientAuth.middleware.js";

import {
  requireAdminAuth,
} from "../../middleware/adminAuth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Client messaging
|--------------------------------------------------------------------------
*/

router.post(
  "/:conversationId",
  requireClientAuth,
  validate(sendMessageSchema),
  sendClientMessageController
);

router.get(
  "/:conversationId",
  requireClientAuth,
  getClientMessagesController
);

router.patch(
  "/:conversationId/read",
  requireClientAuth,
  markClientMessagesReadController
);

/*
|--------------------------------------------------------------------------
| Admin messaging
|--------------------------------------------------------------------------
*/

router.post(
  "/:conversationId/admin",
  requireAdminAuth,
  validate(sendMessageSchema),
  sendAdminMessageController
);

router.get(
  "/:conversationId/admin",
  requireAdminAuth,
  getAdminMessagesController
);

router.patch(
  "/:conversationId/admin/read",
  requireAdminAuth,
  markAdminMessagesReadController
);

export default router;