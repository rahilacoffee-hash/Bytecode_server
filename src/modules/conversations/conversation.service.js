import prisma from "../../config/prisma.js";

import {
  unauthorized,
  forbidden,
  notFound,
} from "../../utils/errors.js";

const CLIENT_ALLOWED_STATUSES = [
  "NEW",
  "DISCUSSING",
];

const CLIENT_ALLOWED_SERVICES = [
  "LANDING_PAGE",
  "BUSINESS_WEBSITE",
  "WEB_APPLICATION",
  "CUSTOM",
];

const CLIENT_ALLOWED_SOURCES = [
  "PORTFOLIO_PRICING",
  "PORTFOLIO_CONTACT",
  "DIRECT",
];

function requireClient(req) {
  if (!req.client?.id) {
    throw unauthorized(
      "Authentication required.",
      "CLIENT_AUTH_REQUIRED"
    );
  }

  return req.client;
}

function validateCreateValues({ service, source }) {
  if (!CLIENT_ALLOWED_SERVICES.includes(service)) {
    throw forbidden(
      "You do not have permission to use this service.",
      "INVALID_CONVERSATION_SERVICE"
    );
  }

  if (!CLIENT_ALLOWED_SOURCES.includes(source)) {
    throw forbidden(
      "You do not have permission to use this conversation source.",
      "INVALID_CONVERSATION_SOURCE"
    );
  }
}

function validateClientUpdate({ status, service }) {
  if (
    status !== undefined &&
    !CLIENT_ALLOWED_STATUSES.includes(status)
  ) {
    throw forbidden(
      "You cannot change the conversation to this status.",
      "CLIENT_STATUS_UPDATE_NOT_ALLOWED"
    );
  }

  if (
    service !== undefined &&
    !CLIENT_ALLOWED_SERVICES.includes(service)
  ) {
    throw forbidden(
      "Invalid conversation service.",
      "INVALID_CONVERSATION_SERVICE"
    );
  }
}

async function getConversationForClient(
  conversationId,
  clientId
) {
  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        clientId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
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

export async function createConversation({
  req,
  service,
  source = "DIRECT",
}) {
  const client = requireClient(req);

  validateCreateValues({
    service,
    source,
  });

  const conversation =
    await prisma.conversation.create({
      data: {
        clientId: client.id,
        service,
        source,
      },

      include: {
        messages: true,
      },
    });

  return conversation;
}

export async function getClientConversations(req) {
  const client = requireClient(req);

  const conversations =
    await prisma.conversation.findMany({
      where: {
        clientId: client.id,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },

        _count: {
          select: {
            messages: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

  return conversations;
}

export async function getClientConversation({
  req,
  conversationId,
}) {
  const client = requireClient(req);

  return getConversationForClient(
    conversationId,
    client.id
  );
}

export async function updateClientConversation({
  req,
  conversationId,
  status,
  service,
}) {
  const client = requireClient(req);

  validateClientUpdate({
    status,
    service,
  });

  await getConversationForClient(
    conversationId,
    client.id
  );

  const conversation =
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        ...(status !== undefined && {
          status,
        }),

        ...(service !== undefined && {
          service,
        }),
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  return conversation;
}
export async function getAllConversations(req) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  const conversations =
    await prisma.conversation.findMany({
      include: {
        client: true,

        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },

        _count: {
          select: {
            messages: true,
          },
        },

        projects: true,
        quotes: true,
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

  return conversations;
}

export async function getAdminConversation({
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

      include: {
        client: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },

        projects: true,
        quotes: true,
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

export async function updateAdminConversation({
  req,
  conversationId,
  status,
  service,
}) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  const existingConversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

  if (!existingConversation) {
    throw notFound(
      "Conversation not found.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  const conversation =
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        ...(status !== undefined && {
          status,
        }),

        ...(service !== undefined && {
          service,
        }),
      },

      include: {
        client: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },

        projects: true,
        quotes: true,
      },
    });

  return conversation;
}
export async function getConversationById({
  req,
  conversationId,
}) {
  const isClient = Boolean(req.client?.id);
  const isAdmin = Boolean(req.admin?.id);

  if (!isClient && !isAdmin) {
    throw unauthorized(
      "Authentication required.",
      "AUTH_REQUIRED"
    );
  }

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      include: {
        client: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },

        projects: true,
        quotes: true,
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  if (
    isClient &&
    !isAdmin &&
    conversation.clientId !== req.client.id
  ) {
    throw forbidden(
      "You do not have access to this conversation.",
      "CONVERSATION_ACCESS_DENIED"
    );
  }

  return conversation;
}