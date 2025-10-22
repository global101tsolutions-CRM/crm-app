export const formatZodError = (error) =>
  error.issues.map((issue) => issue.message).join(", ");
