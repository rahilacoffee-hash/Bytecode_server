import { env } from "./env.js";

/*
 * Fail loud, not silent: if CLIENT_URL is missing or
 * malformed, every socket.io connection attempt will be
 * rejected by CORS with no obvious error on the server
 * side. Log it clearly at startup so a misconfigured env
 * is obvious immediately instead of discovered by trial
 * and error on the client.
 */
if (!env.CLIENT_URL) {
  console.warn(
    "⚠️  CLIENT_URL is not set — Socket.IO CORS will reject every connection."
  );
} else {
  console.log(
    `⚡ Socket.IO CORS origin set to: ${env.CLIENT_URL}`
  );
}

export const socketConfig = {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },

  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false,
  },
};