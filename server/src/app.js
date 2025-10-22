import express from "express";
import cors from "cors";
import morgan from "morgan";

import contactsRouter from "./routes/contacts.js";
import dealsRouter from "./routes/deals.js";
import tasksRouter from "./routes/tasks.js";
import pipelinesRouter from "./routes/pipelines.js";
import companiesRouter from "./routes/companies.js";
import { ok } from "./utils/responses.js";
import { config } from "./config.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const logFormat = (config.logLevel || "dev").toLowerCase();
if (!["silent", "none", "off"].includes(logFormat)) {
  app.use(morgan(logFormat));
}

if (config.nodeEnv !== "production") {
  app.set("json spaces", 2);
}

app.get("/api/health", (_req, res) => ok(res, { status: "ok" }));

app.use("/api/contacts", contactsRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/pipelines", pipelinesRouter);
app.use("/api/companies", companiesRouter);

export default app;
