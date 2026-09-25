import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(
      5000,
      "Message must not exceed 5000 characters."
    ),
});