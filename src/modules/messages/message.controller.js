import {
  sendClientMessage,
  sendAdminMessage,
  getClientMessages,
  getAdminMessages,
  markClientMessagesRead,
  markAdminMessagesRead,
} from "./message.service.js";

import {
  success,
  created,
} from "../../utils/response.js";

export async function sendClientMessageController(
  req,
  res,
  next
) {
  try {
    const result = await sendClientMessage({
      req,
      conversationId:
        req.params.conversationId,
      content: req.body.content,
    });

    return created(
      res,
      result,
      "Message sent successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function sendAdminMessageController(
  req,
  res,
  next
) {
  try {
    const result = await sendAdminMessage({
      req,
      conversationId:
        req.params.conversationId,
      content: req.body.content,
    });

    return created(
      res,
      result,
      "Message sent successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getClientMessagesController(
  req,
  res,
  next
) {
  try {
    const messages = await getClientMessages({
      req,
      conversationId:
        req.params.conversationId,
    });

    return success(
      res,
      { messages },
      "Messages retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getAdminMessagesController(
  req,
  res,
  next
) {
  try {
    const messages = await getAdminMessages({
      req,
      conversationId:
        req.params.conversationId,
    });

    return success(
      res,
      { messages },
      "Messages retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function markClientMessagesReadController(
  req,
  res,
  next
) {
  try {
    const result =
      await markClientMessagesRead({
        req,
        conversationId:
          req.params.conversationId,
      });

    return success(
      res,
      result,
      "Messages marked as read."
    );
  } catch (error) {
    next(error);
  }
}

export async function markAdminMessagesReadController(
  req,
  res,
  next
) {
  try {
    const result =
      await markAdminMessagesRead({
        req,
        conversationId:
          req.params.conversationId,
      });

    return success(
      res,
      result,
      "Messages marked as read."
    );
  } catch (error) {
    next(error);
  }
}