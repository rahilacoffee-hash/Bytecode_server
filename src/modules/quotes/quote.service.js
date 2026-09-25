import prisma from "../../config/prisma.js";
import { emitAdminNotification, emitClientNotification } from "../../services/socket.service.js";

import {
  unauthorized,
  forbidden,
  notFound,
} from "../../utils/errors.js";

function requireClient(req) {
  if (!req.client?.id) {
    throw unauthorized(
      "Authentication required.",
      "CLIENT_AUTH_REQUIRED"
    );
  }

  return req.client;
}

function requireAdmin(req) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  return req.admin;
}

async function ensureClientExists(clientId) {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
  });

  if (!client) {
    throw notFound(
      "Client not found.",
      "CLIENT_NOT_FOUND"
    );
  }

  return client;
}

async function ensureConversationBelongsToClient(
  conversationId,
  clientId
) {
  if (!conversationId) {
    return null;
  }

  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        clientId,
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found for this client.",
      "CONVERSATION_NOT_FOUND"
    );
  }

  return conversation;
}

async function ensureProjectBelongsToClient(
  projectId,
  clientId
) {
  if (!projectId) {
    return null;
  }

  const project =
    await prisma.project.findFirst({
      where: {
        id: projectId,
        clientId,
      },
    });

  if (!project) {
    throw notFound(
      "Project not found for this client.",
      "PROJECT_NOT_FOUND"
    );
  }

  return project;
}

/*
|--------------------------------------------------------------------------
| Create quote
|--------------------------------------------------------------------------
*/

export async function createQuote({
  req,
  clientId,
  conversationId,
  projectId,
  amount,
  description,
  status = "DRAFT",
  expiresAt,
}) {
  requireAdmin(req);

  await ensureClientExists(clientId);

  await ensureConversationBelongsToClient(
    conversationId,
    clientId
  );

  await ensureProjectBelongsToClient(
    projectId,
    clientId
  );

  const quote = await prisma.quote.create({
    data: {
      clientId,
      conversationId:
        conversationId || null,
      projectId: projectId || null,
      amount,
      description: description.trim(),
      status,
      expiresAt: expiresAt
        ? new Date(expiresAt)
        : null,
    },

    include: {
      client: true,
      conversation: true,
      project: true,
    },
  });

  return quote;
}

/*
|--------------------------------------------------------------------------
| Get client quotes
|--------------------------------------------------------------------------
*/

export async function getClientQuotes(req) {
  const client = requireClient(req);

  return prisma.quote.findMany({
    where: {
      clientId: client.id,
    },

    include: {
      conversation: true,
      project: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| Get all quotes
|--------------------------------------------------------------------------
*/

export async function getAllQuotes(req) {
  requireAdmin(req);

  return prisma.quote.findMany({
    include: {
      client: true,
      conversation: true,
      project: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| Get quote by ID
|--------------------------------------------------------------------------
*/

export async function getQuoteById({
  req,
  quoteId,
}) {
  const isClient = Boolean(req.client?.id);
  const isAdmin = Boolean(req.admin?.id);

  if (!isClient && !isAdmin) {
    throw unauthorized(
      "Authentication required.",
      "AUTH_REQUIRED"
    );
  }

  const quote = await prisma.quote.findUnique({
    where: {
      id: quoteId,
    },

    include: {
      client: true,
      conversation: true,
      project: true,
    },
  });

  if (!quote) {
    throw notFound(
      "Quote not found.",
      "QUOTE_NOT_FOUND"
    );
  }

  if (
    isClient &&
    !isAdmin &&
    quote.clientId !== req.client.id
  ) {
    throw forbidden(
      "You do not have access to this quote.",
      "QUOTE_ACCESS_DENIED"
    );
  }

  return quote;
}

/*
|--------------------------------------------------------------------------
| Update quote
|--------------------------------------------------------------------------
*/

export async function updateQuote({
  req,
  quoteId,
  amount,
  description,
  status,
  conversationId,
  projectId,
  expiresAt,
}) {
  requireAdmin(req);

  const existingQuote =
    await prisma.quote.findUnique({
      where: {
        id: quoteId,
      },
    });

  if (!existingQuote) {
    throw notFound(
      "Quote not found.",
      "QUOTE_NOT_FOUND"
    );
  }

  const clientId = existingQuote.clientId;

  if (conversationId !== undefined) {
    await ensureConversationBelongsToClient(
      conversationId,
      clientId
    );
  }

  if (projectId !== undefined) {
    await ensureProjectBelongsToClient(
      projectId,
      clientId
    );
  }

  const quote = await prisma.quote.update({
    where: {
      id: quoteId,
    },

    data: {
      ...(amount !== undefined && {
        amount,
      }),

      ...(description !== undefined && {
        description: description.trim(),
      }),

      ...(status !== undefined && {
        status,
      }),

      ...(conversationId !== undefined && {
        conversationId:
          conversationId || null,
      }),

      ...(projectId !== undefined && {
        projectId: projectId || null,
      }),

      ...(expiresAt !== undefined && {
        expiresAt: expiresAt
          ? new Date(expiresAt)
          : null,
      }),
    },

    include: {
      client: true,
      conversation: true,
      project: true,
    },
  });

  if (existingQuote.status === "DRAFT" && quote.status === "SENT") emitClientNotification(quote.clientId, { type: "QUOTE_SENT", title: "New quote received", message: "You have received a new quote.", quoteId: quote.id, projectId: quote.projectId, conversationId: quote.conversationId });
  return quote;
}

export async function decideClientQuote({ req, quoteId, status }) {
  const client = requireClient(req);
  if (!['ACCEPTED', 'REJECTED'].includes(status)) throw forbidden('Invalid quote decision.', 'INVALID_QUOTE_DECISION');
  const quote = await prisma.quote.findFirst({ where: { id: quoteId, clientId: client.id }, include: { client: true, conversation: true, project: true } });
  if (!quote) throw notFound('Quote not found.', 'QUOTE_NOT_FOUND');
  if (quote.status !== 'SENT') throw forbidden('Only sent quotes can be accepted or rejected.', 'QUOTE_NOT_ACTIONABLE');
  if (quote.expiresAt && quote.expiresAt < new Date()) {
    return prisma.quote.update({ where: { id: quote.id }, data: { status: 'EXPIRED' }, include: { client: true, conversation: true, project: true } });
  }
  const updated = await prisma.quote.update({ where: { id: quote.id }, data: { status }, include: { client: true, conversation: true, project: true } });
  emitAdminNotification("all", { type: status === "ACCEPTED" ? "QUOTE_ACCEPTED" : "QUOTE_REJECTED", title: "Quote decision", message: `${quote.client.name} ${status.toLowerCase()} quote #${quote.id.slice(-8)}.`, quoteId: quote.id, projectId: quote.projectId, conversationId: quote.conversationId });
  return updated;
}
