import { z } from "zod";

const amountSchema = z
  .union([
    z
      .number()
      .finite()
      .positive("Quote amount must be greater than zero."),

    z
      .string()
      .trim()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "Quote amount must be a valid amount."
      )
      .transform(Number)
      .refine(
        (value) => value > 0,
        "Quote amount must be greater than zero."
      ),
  ]);

const quoteStatusSchema = z.enum(
  [
    "DRAFT",
    "SENT",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
  ],
  {
    error: "Please select a valid quote status.",
  }
);

export const createQuoteSchema = z.object({
  clientId: z
    .string()
    .trim()
    .min(1, "Client ID is required."),

  conversationId: z
    .string()
    .trim()
    .min(1, "Conversation ID is required.")
    .optional()
    .nullable(),

  projectId: z
    .string()
    .trim()
    .min(1, "Project ID is required.")
    .optional()
    .nullable(),

  amount: amountSchema,

  description: z
    .string()
    .trim()
    .min(
      5,
      "Quote description must be at least 5 characters."
    )
    .max(
      5000,
      "Quote description must not exceed 5000 characters."
    ),

  status: quoteStatusSchema
    .optional()
    .default("DRAFT"),

  expiresAt: z
    .string()
    .datetime({
      message:
        "Expiration date must be a valid ISO date.",
    })
    .optional()
    .nullable(),
});

export const updateQuoteSchema = z.object({
  amount: amountSchema.optional(),

  description: z
    .string()
    .trim()
    .min(
      5,
      "Quote description must be at least 5 characters."
    )
    .max(
      5000,
      "Quote description must not exceed 5000 characters."
    )
    .optional(),

  status: quoteStatusSchema.optional(),

  conversationId: z
    .string()
    .trim()
    .min(1, "Conversation ID is required.")
    .optional()
    .nullable(),

  projectId: z
    .string()
    .trim()
    .min(1, "Project ID is required.")
    .optional()
    .nullable(),

  expiresAt: z
    .string()
    .datetime({
      message:
        "Expiration date must be a valid ISO date.",
    })
    .optional()
    .nullable(),
});