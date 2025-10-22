const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const normalizeNumber = (value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

export const parseListParams = (query, { defaultSort, allowedSorts }) => {
  const limit = normalizeNumber(query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = normalizeNumber(query.offset, 0, 0);
  const sortKey = (query.sort || "").toLowerCase();
  const sortColumn =
    allowedSorts[sortKey] ?? allowedSorts[defaultSort] ?? defaultSort;
  const order =
    (query.order || query.sortDirection || query.direction || "desc").toLowerCase() ===
    "asc"
      ? "asc"
      : "desc";

  return { limit, offset, sortColumn, sortDirection: order };
};
