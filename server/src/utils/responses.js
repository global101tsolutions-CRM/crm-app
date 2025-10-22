export const ok = (res, data) => res.json({ data });

export const err = (res, code, message) =>
  res.status(code).json({ error: { message } });

export const notFound = (res, message = "Not found") => err(res, 404, message);

export const badRequest = (res, message = "Bad request") =>
  err(res, 400, message);
