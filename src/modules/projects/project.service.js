import prisma from "../../config/prisma.js";
import { emitClientNotification } from "../../services/socket.service.js";

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

export async function createProject({
  req,
  clientId,
  conversationId,
  name,
  service,
  budget,
  status = "PENDING",
}) {
  requireAdmin(req);

  await ensureClientExists(clientId);

  await ensureConversationBelongsToClient(
    conversationId,
    clientId
  );

  const project = await prisma.project.create({
    data: {
      clientId,
      conversationId: conversationId || null,
      name: name.trim(),
      service,
      budget:
        budget !== undefined &&
        budget !== null
          ? budget
          : null,
      status,
    },

    include: {
      client: true,
      conversation: true,
      quotes: true,
    },
  });

  emitClientNotification(project.clientId, { type: "PROJECT_CREATED", title: "New project created", message: "Your project \"" + project.name + "\" has been created.", projectId: project.id, conversationId: project.conversationId });

  return project;
}

export async function getClientProjects(req) {
  const client = requireClient(req);

  return prisma.project.findMany({
    where: {
      clientId: client.id,
    },

    include: {
      conversation: true,
      quotes: true,
    },

    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getAllProjects(req) {
  requireAdmin(req);

  return prisma.project.findMany({
    include: {
      client: true,
      conversation: true,
      quotes: true,
    },

    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getProjectById({
  req,
  projectId,
}) {
  const isClient = Boolean(req.client?.id);
  const isAdmin = Boolean(req.admin?.id);

  if (!isClient && !isAdmin) {
    throw unauthorized(
      "Authentication required.",
      "AUTH_REQUIRED"
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },

    include: {
      client: true,
      conversation: true,
      quotes: true,
    },
  });

  if (!project) {
    throw notFound(
      "Project not found.",
      "PROJECT_NOT_FOUND"
    );
  }

  if (
    isClient &&
    !isAdmin &&
    project.clientId !== req.client.id
  ) {
    throw forbidden(
      "You do not have access to this project.",
      "PROJECT_ACCESS_DENIED"
    );
  }

  return project;
}

export async function updateProject({
  req,
  projectId,
  name,
  conversationId,
  service,
  budget,
  status,
}) {
  requireAdmin(req);

  const existingProject =
    await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

  if (!existingProject) {
    throw notFound(
      "Project not found.",
      "PROJECT_NOT_FOUND"
    );
  }

  if (conversationId !== undefined) {
    await ensureConversationBelongsToClient(
      conversationId,
      existingProject.clientId
    );
  }

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      ...(name !== undefined && {
        name: name.trim(),
      }),

      ...(conversationId !== undefined && {
        conversationId: conversationId || null,
      }),

      ...(service !== undefined && {
        service,
      }),

      ...(budget !== undefined && {
        budget:
          budget === null
            ? null
            : budget,
      }),

      ...(status !== undefined && {
        status,
      }),
    },

    include: {
      client: true,
      conversation: true,
      quotes: true,
    },
  });

  if (status === "IN_PROGRESS" && existingProject.status !== "IN_PROGRESS") {
    emitClientNotification(project.clientId, { type: "PROJECT_STARTED", title: "Project started", message: "Work has started on \"" + project.name + "\".", projectId: project.id, conversationId: project.conversationId });
  }

  return project;
}
