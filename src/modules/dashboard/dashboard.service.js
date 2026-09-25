import prisma from "../../config/prisma.js";

import {
  unauthorized,
} from "../../utils/errors.js";

/*
|--------------------------------------------------------------------------
| Require admin
|--------------------------------------------------------------------------
*/

function requireAdmin(req) {
  if (!req.admin?.id) {
    throw unauthorized(
      "Admin authentication required.",
      "ADMIN_AUTH_REQUIRED"
    );
  }

  return req.admin;
}

/*
|--------------------------------------------------------------------------
| Dashboard statistics
|--------------------------------------------------------------------------
*/

export async function getDashboardStats(req) {
  requireAdmin(req);

  const [
    totalClients,
    newClients,
    activeConversations,
    unreadMessages,
    totalProjects,
    projectsInProgress,
    completedProjects,
    pendingQuotes,
    acceptedQuotes,
  ] = await Promise.all([
    /*
    | Total clients
    */
    prisma.client.count(),

    /*
    | Clients created in the last 30 days
    */
    prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(
            Date.now() -
              30 * 24 * 60 * 60 * 1000
          ),
        },
      },
    }),

    /*
    | Active conversations
    */
    prisma.conversation.count({
      where: {
        status: {
          in: [
            "NEW",
            "DISCUSSING",
            "QUOTE_SENT",
            "NEGOTIATING",
            "PAID",
            "IN_PROGRESS",
          ],
        },
      },
    }),

    /*
    | Messages waiting for admin to read
    */
    prisma.message.count({
      where: {
        senderType: "CLIENT",
        readAt: null,
      },
    }),

    /*
    | Total projects
    */
    prisma.project.count(),

    /*
    | Projects currently in progress
    */
    prisma.project.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    /*
    | Completed projects
    */
    prisma.project.count({
      where: {
        status: "COMPLETED",
      },
    }),

    /*
    | Quotes waiting for action
    */
    prisma.quote.count({
      where: {
        status: {
          in: ["DRAFT", "SENT"],
        },
      },
    }),

    /*
    | Accepted quotes
    */
    prisma.quote.count({
      where: {
        status: "ACCEPTED",
      },
    }),
  ]);

  return {
    totalClients,
    newClients,
    activeConversations,
    unreadMessages,
    totalProjects,
    projectsInProgress,
    completedProjects,
    pendingQuotes,
    acceptedQuotes,
  };
}

/*
|--------------------------------------------------------------------------
| Recent conversations
|--------------------------------------------------------------------------
*/

export async function getRecentConversations(req) {
  requireAdmin(req);

  return prisma.conversation.findMany({
    take: 10,

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
        },
      },

      messages: {
        take: 1,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          senderType: true,
          content: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
  });
}

/*
|--------------------------------------------------------------------------
| Recent projects
|--------------------------------------------------------------------------
*/

export async function getRecentProjects(req) {
  requireAdmin(req);

  return prisma.project.findMany({
    take: 10,

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },

      conversation: {
        select: {
          id: true,
          service: true,
          status: true,
        },
      },
    },
  });
}

/*
|--------------------------------------------------------------------------
| Recent quotes
|--------------------------------------------------------------------------
*/

export async function getRecentQuotes(req) {
  requireAdmin(req);

  return prisma.quote.findMany({
    take: 10,

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
          service: true,
          status: true,
        },
      },

      conversation: {
        select: {
          id: true,
          service: true,
          status: true,
        },
      },
    },
  });
}