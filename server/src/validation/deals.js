import { z } from "zod";

const baseSchema = z.object({
  name: z
    .string({ invalid_type_error: "Deal name must be a string." })
    .trim()
    .min(1, "Deal name is required.")
    .max(140, "Deal name must be shorter than 140 characters."),
  amount: z
    .coerce
    .number({
      invalid_type_error: "Amount must be a number.",
    })
    .min(0, "Amount cannot be negative.")
    .optional(),
  pipeline_id: z
    .string({ invalid_type_error: "Pipeline id must be a string." })
    .trim()
    .min(1, "Pipeline id is required.")
    .optional(),
  stage_id: z
    .string({ invalid_type_error: "Stage id must be a string." })
    .trim()
    .min(1, "Stage id is required.")
    .optional(),
  company: z
    .string({ invalid_type_error: "Company must be a string." })
    .trim()
    .max(120, "Company must be shorter than 120 characters.")
    .optional(),
  owner: z
    .string({ invalid_type_error: "Owner must be a string." })
    .trim()
    .max(120, "Owner must be shorter than 120 characters.")
    .optional(),
});

export const createDealSchema = baseSchema;

export const updateDealSchema = baseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (!Object.keys(data).length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one field to update.",
      });
    }
  });
