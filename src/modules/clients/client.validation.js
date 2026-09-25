import { z } from "zod";

export const clientUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must not exceed 100 characters.")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),

  companyName: z
    .string()
    .trim()
    .max(150, "Company name is too long.")
    .optional()
    .or(z.literal("")),
});