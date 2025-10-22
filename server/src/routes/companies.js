import { Router } from "express";
import { db } from "../db.js";
import { badRequest, notFound, ok } from "../utils/responses.js";

const router = Router();

const normaliseCompany = (value) => value?.trim().toLowerCase();

router.get("/:companyId", (req, res) => {
  const raw = decodeURIComponent(req.params.companyId ?? "");
  const companyKey = normaliseCompany(raw);
  if (!companyKey) {
    return badRequest(res, "Company identifier is required.");
  }

  const contacts = db
    .prepare(
      `
      select *
      from contacts
      where lower(company) = @company
      order by last_name collate nocase asc, first_name collate nocase asc
    `
    )
    .all({ company: companyKey });

  const deals = db
    .prepare(
      `
      select d.*, s.name as stage_name, p.name as pipeline_name
      from deals d
      join stages s on s.id = d.stage_id
      join pipelines p on p.id = d.pipeline_id
      where lower(d.company) = @company
      order by d.updated_at desc
    `
    )
    .all({ company: companyKey });

  if (!contacts.length && !deals.length) {
    return notFound(res, "Company not found.");
  }

  const tasks = db
    .prepare(
      `
      select *
      from tasks
      where lower(ifnull(related_id, '')) = @company
        and lower(ifnull(related_type, '')) in ('company', 'organisation', 'organization')
      order by coalesce(due_at, created_at) asc
      limit 200
    `
    )
    .all({ company: companyKey });

  const owners = new Set();
  deals.forEach((deal) => {
    if (deal.owner) owners.add(deal.owner);
  });

  const stageBreakdown = {};
  let pipelineValue = 0;
  deals.forEach((deal) => {
    pipelineValue += Number(deal.amount ?? 0);
    const stage = deal.stage_name || "Unknown";
    stageBreakdown[stage] = (stageBreakdown[stage] || 0) + 1;
  });

  const lastContactActivity = contacts.reduce(
    (acc, contact) => (contact.updated_at > acc ? contact.updated_at : acc),
    ""
  );
  const lastDealActivity = deals.reduce(
    (acc, deal) => (deal.updated_at > acc ? deal.updated_at : acc),
    ""
  );

  const canonicalName =
    contacts[0]?.company || deals[0]?.company || raw || "Unknown company";

  const summary = {
    name: canonicalName,
    contactsCount: contacts.length,
    dealsCount: deals.length,
    pipelineValue,
    owners: Array.from(owners),
    lastActivity:
      lastDealActivity && lastDealActivity > lastContactActivity
        ? lastDealActivity
        : lastContactActivity,
    stageBreakdown,
  };

  ok(res, { summary, contacts, deals, tasks });
});

export default router;
