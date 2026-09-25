import { z } from "zod";

const serviceSchema = z.enum(
  [
    "LANDING_PAGE",
    "BUSINESS_WEBSITE",
    "WEB_APPLICATION",
    "CUSTOM",
  ],
  {
    error: "Please select a valid service.",
  }
);

const sourceSchema = z.enum(
  [
    "PORTFOLIO_PRICING",
    "PORTFOLIO_CONTACT",
    "DIRECT",
  ],
  {
    error: "Please select a valid conversation source.",
  }
);

const conversationStatusSchema = z.enum(
  [
    "NEW",
    "DISCUSSING",
    "QUOTE_SENT",
    "NEGOTIATING",
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "ARCHIVED",
  ],
  {
    error: "Please select a valid conversation status.",
  }
);

export const createConversationSchema = z.object({
  service: serviceSchema,

  source: sourceSchema.optional().default("DIRECT"),
});

export const updateConversationSchema = z.object({
  status: conversationStatusSchema.optional(),

  service: serviceSchema.optional(),
});