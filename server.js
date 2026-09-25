import "dotenv/config";
import http from "http";

import app from "./src/app.js";
import { initializeSocket } from "./src/services/socket.service.js";

const PORT = process.env.PORT || 5001;

const httpServer = http.createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(
    `🚀 BYTECODEE API running on http://localhost:${PORT}`
  );

  console.log(
    `⚡ Socket.IO running on ws://localhost:${PORT}`
  );
});