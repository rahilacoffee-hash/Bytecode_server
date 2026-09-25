import prisma from "../../config/prisma.js";

import {
  unauthorized,
  notFound,
} from "../../utils/errors.js";

import {
  emitNewMessage,
  emitConversationUpdated,
  emitClientNotification,
  emitAdminNotification,
  getIO,
} from "../../services/socket.service.js";

function requireClient(req) {
  if (!req.client?.id) {
    throw unauthorized(
      "Authentication required.",
      "CLIENT_AUTH_REQUIRED"
    );
  }

  return req.client;
}

async function getClientConversation(
  conversationId,
  clientId
) {
  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        clientId,
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  return conversation;
}

function isSocketReady() {
  try {
    getIO();
    return true;
  } catch {
    return false;
  }
}

export async function sendClientMessage({
  req,
  conversationId,
  content,
}) {
  const client = requireClient(req);

  const conversation =
    await getClientConversation(
      conversationId,
      client.id
    );

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message content cannot be empty.");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const message =
        await tx.message.create({
          data: {
            conversationId:
              conversation.id,
            senderType: "CLIENT",
            content: trimmedContent,
          },
        });

      let updatedConversation =
        conversation;

      if (conversation.status === "NEW") {
        updatedConversation =
          await tx.conversation.update({
            where: {
              id: conversation.id,
            },
            data: {
              status: "DISCUSSING",
            },
          });
      }

      return {
        message,
        conversation:
          updatedConversation,
      };
    }
  );

  if (isSocketReady()) {
    emitNewMessage(
      conversationId,
      result.message
    );

    emitConversationUpdated(
      conversationId,
      result.conversation
    );

    emitClientNotification(
      client.id,
      {
        type: "MESSAGE_SENT",
        conversationId,
        messageId: result.message.id,
      }
    );

    emitAdminNotification(
      "all",
      {
        type: "NEW_CLIENT_MESSAGE",
        conversationId,
        messageId: result.message.id,
        clientId: client.id,
      }
    );
  }

  return result;
}

export async function sendAdminMessage({
  req,
  conversationId,
  content,
}) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error(
      "Message content cannot be empty."
    );
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const message =
        await tx.message.create({
          data: {
            conversationId,
            senderType: "ADMIN",
            content: trimmedContent,
          },
        });

      let updatedConversation =
        conversation;

      if (
        conversation.status === "NEW" ||
        conversation.status === "DISCUSSING"
      ) {
        updatedConversation =
          await tx.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              status: "DISCUSSING",
            },
          });
      }

      return {
        message,
        conversation:
          updatedConversation,
      };
    }
  );

  if (isSocketReady()) {
    emitNewMessage(
      conversationId,
      result.message
    );

    emitConversationUpdated(
      conversationId,
      result.conversation
    );

    emitClientNotification(
      conversation.clientId,
      {
        type: "NEW_ADMIN_MESSAGE",
        conversationId,
        messageId: result.message.id,
      }
    );

    emitAdminNotification(
      req.admin.id,
      {
        type: "MESSAGE_SENT",
        conversationId,
        messageId: result.message.id,
      }
    );
  }

  return result;
}

export async function getClientMessages({
  req,
  conversationId,
}) {
  const client = requireClient(req);

  await getClientConversation(
    conversationId,
    client.id
  );

  return prisma.message.findMany({
    where: {
      conversationId,
    },

    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getAdminMessages({
  req,
  conversationId,
}) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  return prisma.message.findMany({
    where: {
      conversationId,
    },

    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function markClientMessagesRead({
  req,
  conversationId,
}) {
  const client = requireClient(req);

  await getClientConversation(
    conversationId,
    client.id
  );

  const result =
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderType: "ADMIN",
        readAt: null,
      },

      data: {
        readAt: new Date(),
      },
    });

  return {
    updatedCount: result.count,
  };
}

export async function markAdminMessagesRead({
  req,
  conversationId,
}) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  const result =
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderType: "CLIENT",
        readAt: null,
      },

      data: {
        readAt: new Date(),
      },
    });

  return {
    updatedCount: result.count,
  };
}