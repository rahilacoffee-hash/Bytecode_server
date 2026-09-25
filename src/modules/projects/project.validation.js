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

const projectStatusSchema = z.enum(
  [
    "PENDING",
    "IN_PROGRESS",
    "REVIEW",
    "COMPLETED",
    "CANCELLED",
  ],
  {
    error: "Please select a valid project status.",
  }
);

const budgetSchema = z
  .union([
    z.number().nonnegative(),
    z
      .string()
      .trim()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "Budget must be a valid amount."
      )
      .transform(Number),
  ])
  .optional()
  .nullable();

export const createProjectSchema = z.object({
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

  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(
      150,
      "Project name must not exceed 150 characters."
    ),

  service: serviceSchema,

  budget: budgetSchema,

  status: projectStatusSchema
    .optional()
    .default("PENDING"),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(
      150,
      "Project name must not exceed 150 characters."
    )
    .optional(),

  conversationId: z
    .string()
    .trim()
    .min(1, "Conversation ID is required.")
    .optional()
    .nullable(),

  service: serviceSchema.optional(),

  budget: budgetSchema,

  status: projectStatusSchema.optional(),
});