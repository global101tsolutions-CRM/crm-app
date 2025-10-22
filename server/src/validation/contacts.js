import { z } from "zod";

const baseSchema = z.object({
  first_name: z
    .string({ invalid_type_error: "First name must be a string." })
    .trim()
    .min(1, "First name must contain at least 1 character.")
    .max(100, "First name must be shorter than 100 characters.")
    .optional(),
  last_name: z
    .string({ invalid_type_error: "Last name must be a string." })
    .trim()
    .min(1, "Last name must contain at least 1 character.")
    .max(100, "Last name must be shorter than 100 characters.")
    .optional(),
  email: z
    .string({ invalid_type_error: "Email must be a string." })
    .trim()
    .email("Email must be valid.")
    .optional(),
  phone: z
    .string({ invalid_type_error: "Phone must be a string." })
    .trim()
    .max(40, "Phone must be shorter than 40 characters.")
    .optional(),
  title: z
    .string({ invalid_type_error: "Title must be a string." })
    .trim()
    .max(100, "Title must be shorter than 100 characters.")
    .optional(),
  address: z
    .string({ invalid_type_error: "Address must be a string." })
    .trim()
    .max(200, "Address must be shorter than 200 characters.")
    .optional(),
  company: z
    .string({ invalid_type_error: "Company must be a string." })
    .trim()
    .max(120, "Company must be shorter than 120 characters.")
    .optional(),
});

export const createContactSchema = baseSchema.superRefine((data, ctx) => {
  if (!data.first_name && !data.last_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Contact needs at least a first or last name.",
    });
  }
});

export const updateContactSchema = baseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (!Object.keys(data).length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one field to update.",
      });
    }
  });
