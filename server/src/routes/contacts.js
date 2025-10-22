import { Router } from "express";
import { db } from "../db.js";
import { nanoid } from "nanoid";
import { badRequest, notFound, ok } from "../utils/responses.js";
import { formatZodError } from "../utils/validation.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validation/contacts.js";
import { parseListParams } from "../utils/pagination.js";

const router = Router();
const CONTACT_SORTS = {
  updated_at: "updated_at",
  created_at: "created_at",
  first_name: "first_name",
  last_name: "last_name",
  company: "company",
};

router.get("/", (req, res) => {
  const q = req.query.q?.trim();
  const { limit, offset, sortColumn, sortDirection } = parseListParams(
    req.query,
    { defaultSort: "updated_at", allowedSorts: CONTACT_SORTS }
  );
  let rows;
  if (q) {
    rows = db
      .prepare(
        `
        select *
        from contacts
        where lower(first_name || ' ' || last_name || ' ' || ifnull(email,'') || ' ' || ifnull(phone,'')) like @pattern
        order by ${sortColumn} ${sortDirection}, id asc
        limit @limit offset @offset
      `
      )
      .all({
        pattern: `%${q.toLowerCase()}%`,
        limit,
        offset,
      });
  } else {
    rows = db
      .prepare(
        `
        select *
        from contacts
        order by ${sortColumn} ${sortDirection}, id asc
        limit @limit offset @offset
      `
      )
      .all({ limit, offset });
  }
  ok(res, rows);
});

router.post("/", (req, res) => {
  const parsed = createContactSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return badRequest(res, formatZodError(parsed.error));
  }
  const { first_name, last_name, email, phone, company, title, address } = parsed.data;
  const id = nanoid();
  const now = new Date().toISOString();
  db.prepare(
    `
    insert into contacts(id, first_name, last_name, email, phone, title, address, company, created_at, updated_at)
    values(@id, @first_name, @last_name, @email, @phone, @title, @address, @company, @now, @now)
  `
  ).run({
    id,
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    email: email ?? null,
    phone: phone ?? null,
    title: title ?? null,
    address: address ?? null,
    company: company ?? null,
    now,
  });
  const row = db.prepare("select * from contacts where id = ?").get(id);
  ok(res, row);
});

router.get("/:id", (req, res) => {
  const row = db.prepare("select * from contacts where id = ?").get(req.params.id);
  if (!row) return notFound(res);
  ok(res, row);
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("select * from contacts where id = ?").get(req.params.id);
  if (!existing) return notFound(res);
  const parsed = updateContactSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return badRequest(res, formatZodError(parsed.error));
  }
  const { first_name, last_name, email, phone, company, title, address } = parsed.data;
  const now = new Date().toISOString();
  db.prepare(
    `
    update contacts set
      first_name = coalesce(@first_name, first_name),
      last_name = coalesce(@last_name, last_name),
      email = coalesce(@email, email),
      phone = coalesce(@phone, phone),
      title = coalesce(@title, title),
      address = coalesce(@address, address),
      company = coalesce(@company, company),
      updated_at = @now
    where id = @id
  `
  ).run({
    id: req.params.id,
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    email: email ?? null,
    phone: phone ?? null,
    title: title ?? null,
    address: address ?? null,
    company: company ?? null,
    now,
  });
  const row = db.prepare("select * from contacts where id = ?").get(req.params.id);
  ok(res, row);
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("delete from contacts where id = ?").run(req.params.id);
  ok(res, { deleted: info.changes > 0 });
});

export default router;
