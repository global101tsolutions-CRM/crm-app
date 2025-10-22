import { Router } from "express";
import { db } from "../db.js";
import { ok } from "../utils/responses.js";

const router = Router();

router.get("/", (_req, res) => {
  const pipelines = db.prepare("select * from pipelines order by name").all();
  const stages = db
    .prepare("select * from stages order by order_index")
    .all();
  ok(res, { pipelines, stages });
});

export default router;
