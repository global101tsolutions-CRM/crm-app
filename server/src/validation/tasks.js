import { z } from "zod";

export const createTaskSchema = z.object({
  subject: z
    .string({ invalid_type_error: "Subject must be a string." })
    .trim()
    .min(1, "Task needs a subject.")
    .max(180, "Subject must be shorter than 180 characters."),
  due_at: z
    .string({ invalid_type_error: "Due date must be a string." })
    .datetime({ message: "Due date must be an ISO datetime string." })
    .optional(),
  related_type: z
    .string({ invalid_type_error: "Related type must be a string." })
    .trim()
    .max(60, "Related type must be shorter than 60 characters.")
    .optional(),
  related_id: z
    .string({ invalid_type_error: "Related id must be a string." })
    .trim()
    .max(60, "Related id must be shorter than 60 characters.")
    .optional(),
  owner: z
    .string({ invalid_type_error: "Owner must be a string." })
    .trim()
    .max(120, "Owner must be shorter than 120 characters.")
    .optional(),
});
