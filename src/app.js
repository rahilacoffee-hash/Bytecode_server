import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import clientRoutes from "./modules/clients/client.routes.js";
import conversationRoutes from "./modules/conversations/conversation.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import quoteRoutes from "./modules/quotes/quote.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import homepageRoutes from "./modules/homepage/homepage.routes.js";

import { generalRateLimiter } from "./middleware/rateLimiter.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);


/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "8mb" }));

app.use(express.urlencoded({
  extended: true,
}));

app.use(cookieParser());


/*
|--------------------------------------------------------------------------
| GENERAL RATE LIMIT
|--------------------------------------------------------------------------
*/

app.use(generalRateLimiter);


/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/health",
  healthRoutes
);


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/clients",
  clientRoutes
);

app.use(
  "/api/v1/conversations",
  conversationRoutes
);

app.use(
  "/api/v1/messages",
  messageRoutes
);

app.use(
  "/api/v1/projects",
  projectRoutes
);

app.use(
  "/api/v1/quotes",
  quoteRoutes
);

app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);

app.use(
  "/api/v1/homepage",
  homepageRoutes
);

/*
|--------------------------------------------------------------------------
| ERROR HANDLING
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

export default app;