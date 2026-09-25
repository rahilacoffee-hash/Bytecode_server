import {
  createConversation,
  getClientConversations,
  getClientConversation,
  updateClientConversation,
  getAllConversations,
  updateAdminConversation,
  getConversationById,
} from "./conversation.service.js";

import {
  success,
  created,
} from "../../utils/response.js";

export async function createConversationController(
  req,
  res,
  next
) {
  try {
    const conversation = await createConversation({
      req,
      ...req.body,
    });

    return created(
      res,
      { conversation },
      "Conversation created successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getClientConversationsController(
  req,
  res,
  next
) {
  try {
    const conversations =
      await getClientConversations(req);

    return success(
      res,
      { conversations },
      "Conversations retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getClientConversationController(
  req,
  res,
  next
) {
  try {
    const conversation =
      await getClientConversation({
        req,
        conversationId:
          req.params.conversationId,
      });

    return success(
      res,
      { conversation },
      "Conversation retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function updateClientConversationController(
  req,
  res,
  next
) {
  try {
    const conversation =
      await updateClientConversation({
        req,
        conversationId:
          req.params.conversationId,
        ...req.body,
      });

    return success(
      res,
      { conversation },
      "Conversation updated successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getAllConversationsController(
  req,
  res,
  next
) {
  try {
    const conversations =
      await getAllConversations(req);

    return success(
      res,
      { conversations },
      "Conversations retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function updateAdminConversationController(
  req,
  res,
  next
) {
  try {
    const conversation =
      await updateAdminConversation({
        req,
        conversationId:
          req.params.conversationId,
        ...req.body,
      });

    return success(
      res,
      { conversation },
      "Conversation updated successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getConversationByIdController(
  req,
  res,
  next
) {
  try {
    const conversation =
      await getConversationById({
        req,
        conversationId:
          req.params.conversationId,
      });

    return success(
      res,
      { conversation },
      "Conversation retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}