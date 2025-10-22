import { Router } from "express";
import { db } from "../db.js";
import { nanoid } from "nanoid";
import { badRequest, ok } from "../utils/responses.js";
import { formatZodError } from "../utils/validation.js";
import { createTaskSchema } from "../validation/tasks.js";
import { parseListParams } from "../utils/pagination.js";

const router = Router();

const TASK_SORTS = {
  due_at: "due_at",
  created_at: "created_at",
  subject: "subject",
  owner: "owner",
};

router.get("/", (req, res) => {
  const { limit, offset, sortColumn, sortDirection } = parseListParams(
    req.query,
    { defaultSort: "due_at", allowedSorts: TASK_SORTS }
  );
  const rows = db
    .prepare(
      `
      select *
      from tasks
      order by ${sortColumn} ${sortDirection}, id asc
      limit @limit offset @offset
    `
    )
    .all({ limit, offset });
  ok(res, rows);
});

router.post("/", (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return badRequest(res, formatZodError(parsed.error));
  }
  const { subject, due_at, related_type, related_id, owner } = parsed.data;
  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare(
    `
    insert into tasks(id, subject, due_at, related_type, related_id, owner, status, created_at)
    values(@id, @subject, @due_at, @related_type, @related_id, @owner, 'open', @now)
  `
  ).run({
    id,
    subject,
    due_at: due_at ?? null,
    related_type: related_type ?? null,
    related_id: related_id ?? null,
    owner: owner ?? null,
    now,
  });
  const row = db.prepare("select * from tasks where id = ?").get(id);
  ok(res, row);
});

export default router;
