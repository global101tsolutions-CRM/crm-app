import { Router } from "express";
import { db } from "../db.js";
import { nanoid } from "nanoid";
import { badRequest, notFound, ok } from "../utils/responses.js";
import { formatZodError } from "../utils/validation.js";
import { createDealSchema, updateDealSchema } from "../validation/deals.js";
import { parseListParams } from "../utils/pagination.js";

const router = Router();

const DEAL_SORTS = {
  updated_at: "d.updated_at",
  created_at: "d.created_at",
  amount: "d.amount",
  name: "d.name",
  company: "d.company",
  owner: "d.owner",
  stage: "s.name",
  pipeline: "p.name",
};

router.get("/", (req, res) => {
  const { limit, offset, sortColumn, sortDirection } = parseListParams(
    req.query,
    { defaultSort: "updated_at", allowedSorts: DEAL_SORTS }
  );
  const rows = db
    .prepare(
      `
      select d.*, s.name as stage_name, p.name as pipeline_name
      from deals d
      join stages s on s.id = d.stage_id
      join pipelines p on p.id = d.pipeline_id
      order by ${sortColumn} ${sortDirection}, d.id asc
      limit @limit offset @offset
    `
    )
    .all({ limit, offset });
  ok(res, rows);
});

router.post("/", (req, res) => {
  const parsed = createDealSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return badRequest(res, formatZodError(parsed.error));
  }
  const { name, amount, pipeline_id, stage_id, company, owner } = parsed.data;
  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare(
    `
    insert into deals(id, name, amount, pipeline_id, stage_id, company, owner, created_at, updated_at)
    values(@id, @name, @amount, @pipeline_id, @stage_id, @company, @owner, @now, @now)
  `
  ).run({
    id,
    name,
    amount: amount ?? 0,
    pipeline_id: pipeline_id ?? null,
    stage_id: stage_id ?? null,
    company: company ?? null,
    owner: owner ?? null,
    now,
  });
  const row = db
    .prepare(
      `
      select d.*, s.name as stage_name, p.name as pipeline_name
      from deals d
      join stages s on s.id = d.stage_id
      join pipelines p on p.id = d.pipeline_id
      where d.id = ?
    `
    )
    .get(id);
  ok(res, row);
});

router.put("/:id", (req, res) => {
  const now = new Date().toISOString();
  const exists = db.prepare("select * from deals where id = ?").get(req.params.id);
  if (!exists) return notFound(res);
  const parsed = updateDealSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return badRequest(res, formatZodError(parsed.error));
  }
  const { name, amount, stage_id, pipeline_id, company, owner } = parsed.data;
  db.prepare(
    `
    update deals
    set name = coalesce(@name, name),
        amount = coalesce(@amount, amount),
        pipeline_id = coalesce(@pipeline_id, pipeline_id),
        stage_id = coalesce(@stage_id, stage_id),
        company = coalesce(@company, company),
        owner = coalesce(@owner, owner),
        updated_at = @now
    where id = @id
  `
  ).run({
    id: req.params.id,
    name: name ?? null,
    amount: amount ?? null,
    pipeline_id: pipeline_id ?? null,
    stage_id: stage_id ?? null,
    company: company ?? null,
    owner: owner ?? null,
    now,
  });
  const row = db
    .prepare(
      `
      select d.*, s.name as stage_name, p.name as pipeline_name
      from deals d
      join stages s on s.id = d.stage_id
      join pipelines p on p.id = d.pipeline_id
      where d.id = ?
    `
    )
    .get(req.params.id);
  ok(res, row);
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("delete from deals where id = ?").run(req.params.id);
  ok(res, { deleted: info.changes > 0 });
});

export default router;
