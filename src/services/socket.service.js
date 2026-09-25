import { Server } from "socket.io";

import prisma from "../config/prisma.js";
import { socketConfig } from "../config/socket.js";

import { getClientSession, getAdminSession } from "./session.service.js";

let io = null;

const CLIENT_SESSION_COOKIE = "bytecodee_client_session";

const ADMIN_SESSION_COOKIE = "bytecodee_admin_session";

/**
 * Parse the raw Cookie header.
 */
function parseCookies(cookieHeader = "") {
  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (!name) {
      return;
    }

    cookies[name] = decodeURIComponent(valueParts.join("="));
  });

  return cookies;
}

/**
 * Authenticate a Socket.IO connection
 * using the existing HttpOnly session cookies.
 */
async function authenticateSocket(socket) {
  const cookieHeader = socket.request.headers.cookie || "";

  const cookies = parseCookies(cookieHeader);

  /*
  |--------------------------------------------------------------------------
  | Load all valid sessions
  |--------------------------------------------------------------------------
  |
  | A browser may hold both client and admin cookies. Keep both identities
  | and prefer the admin role for socket authorization, matching HTTP routes.
  */

  const clientToken = cookies[CLIENT_SESSION_COOKIE];

  if (clientToken) {
    const session = await getClientSession(clientToken);

    if (session) {
      socket.clientUser = session.client;
      socket.clientSession = session;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Try admin authentication
  |--------------------------------------------------------------------------
  */

  const adminToken = cookies[ADMIN_SESSION_COOKIE];

  if (adminToken) {
    const session = await getAdminSession(adminToken);

    if (session) {
      socket.userType = "ADMIN";
      socket.admin = session.admin;
      socket.adminSession = session;

      return true;
    }
  }

  if (socket.clientUser) {
    socket.userType = "CLIENT";
    return true;
  }

  return false;
}

/**
 * Check whether the connected user is allowed
 * to access a specific conversation.
 */
async function canJoinConversation(socket, conversationId) {
  if (typeof conversationId !== "string" || !conversationId.trim()) {
    return false;
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },

    select: {
      id: true,
      clientId: true,
    },
  });

  if (!conversation) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Client access
  |--------------------------------------------------------------------------
  |
  | A client can only access conversations
  | belonging to their own client account.
  |
  */

  if (socket.userType === "CLIENT") {
    return conversation.clientId === socket.clientUser.id;
  }

  /*
  |--------------------------------------------------------------------------
  | Admin access
  |--------------------------------------------------------------------------
  |
  | Authenticated admins can access
  | any conversation.
  |
  */

  if (socket.userType === "ADMIN") {
    return true;
  }

  if (socket.clientUser) {
    socket.userType = "CLIENT";

    return true;
  }

  return false;
}

/**
 * Initialize Socket.IO.
 */
export function initializeSocket(httpServer) {
  io = new Server(httpServer, socketConfig);

  /*
  |--------------------------------------------------------------------------
  | Socket authentication middleware
  |--------------------------------------------------------------------------
  */

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.request.headers.cookie || "");
      if (!cookies[CLIENT_SESSION_COOKIE] && !cookies[ADMIN_SESSION_COOKIE]) return next(new Error("Authentication required"));
      if (!(await authenticateSocket(socket))) return next(new Error("Authentication required"));
      return next();
    } catch (error) { return next(error); }
  });

  /*
  |--------------------------------------------------------------------------
  | Socket connection
  |--------------------------------------------------------------------------
  */

  io.on("connection", (socket) => {
    if (socket.userType === "CLIENT") socket.join(`client:${socket.clientUser.id}`);
    if (socket.userType === "ADMIN") { socket.join(`admin:${socket.admin.id}`); socket.join("admins"); }
    console.log(`🔌 Socket connected: ${socket.id} (${socket.userType})`);

    /*
    |--------------------------------------------------------------------------
    | CLIENT PRIVATE ROOM
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | ADMIN PRIVATE + SHARED ROOM
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | JOIN CONVERSATION
    |--------------------------------------------------------------------------
    */

    socket.on("conversation:join", async (conversationId) => {
      try {
        const allowed = await canJoinConversation(socket, conversationId);

        if (!allowed) {
          socket.emit("socket:error", {
            code: "CONVERSATION_ACCESS_DENIED",

            message: "You do not have access to this conversation.",
          });

          return;
        }

        const room = `conversation:${conversationId}`;

        socket.join(room);

        socket.emit("conversation:joined", {
          conversationId,
        });

        console.log(
          `💬 ${socket.userType} joined conversation ${conversationId}`,
        );
      } catch (error) {
        console.error("Conversation join error:", error);

        socket.emit("socket:error", {
          code: "CONVERSATION_JOIN_FAILED",

          message: "Unable to join conversation.",
        });
      }
    });

    /*
    |--------------------------------------------------------------------------
    | LEAVE CONVERSATION
    |--------------------------------------------------------------------------
    */

    socket.on("conversation:leave", (conversationId) => {
      if (typeof conversationId !== "string" || !conversationId.trim()) {
        return;
      }

      const room = `conversation:${conversationId}`;

      socket.leave(room);

      socket.emit("conversation:left", {
        conversationId,
      });

      console.log(`🚪 ${socket.userType} left conversation ${conversationId}`);
    });

    /*
    |--------------------------------------------------------------------------
    | TYPING START
    |--------------------------------------------------------------------------
    */

    socket.on("typing:start", async (conversationId) => {
      try {
        const allowed = await canJoinConversation(socket, conversationId);

        if (!allowed) {
          return;
        }

        const senderId =
          socket.userType === "CLIENT" ? socket.clientUser.id : socket.admin.id;

        socket.to(`conversation:${conversationId}`).emit("typing:start", {
          conversationId,

          senderType: socket.userType,

          senderId,
        });
      } catch (error) {
        console.error("Typing start error:", error);
      }
    });

    /*
    |--------------------------------------------------------------------------
    | TYPING STOP
    |--------------------------------------------------------------------------
    */

    socket.on("typing:stop", async (conversationId) => {
      try {
        const allowed = await canJoinConversation(socket, conversationId);

        if (!allowed) {
          return;
        }

        const senderId =
          socket.userType === "CLIENT" ? socket.clientUser.id : socket.admin.id;

        socket.to(`conversation:${conversationId}`).emit("typing:stop", {
          conversationId,

          senderType: socket.userType,

          senderId,
        });
      } catch (error) {
        console.error("Typing stop error:", error);
      }
    });

    /*
    |--------------------------------------------------------------------------
    | DISCONNECT
    |--------------------------------------------------------------------------
    */

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("⚡ Socket.IO initialized");

  return io;
}

/**
 * Get the Socket.IO instance.
 */
export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
}

/**
 * Emit a new message to everyone
 * inside a conversation.
 */
export function emitNewMessage(conversationId, message) {
  getIO().to(`conversation:${conversationId}`).emit("message:new", message);
}

/**
 * Emit a conversation update.
 */
export function emitConversationUpdated(conversationId, conversation) {
  getIO()
    .to(`conversation:${conversationId}`)
    .emit("conversation:updated", conversation);
}

/**
 * Notify a specific client.
 */
export function emitClientNotification(clientId, notification) {
  getIO().to(`client:${clientId}`).emit("notification:new", notification);
}

/**
 * Notify a specific admin or all admins.
 */
export function emitAdminNotification(adminId, notification) {
  const room = adminId === "all" ? "admins" : `admin:${adminId}`;

  getIO().to(room).emit("notification:new", notification);
}
