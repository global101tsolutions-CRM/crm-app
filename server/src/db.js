
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../src/schema.sql");

const dbPath = config.dbPath;
const isMemory = dbPath === ":memory:";
if (!isMemory) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const firstTime = isMemory || !fs.existsSync(dbPath);
export const db = new Database(dbPath);

if (firstTime) {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  console.log("Database initialized.");
}

const indexStatements = `
create index if not exists contacts_updated_at_idx on contacts(updated_at desc, id);
create index if not exists contacts_created_at_idx on contacts(created_at desc, id);
create index if not exists contacts_name_idx on contacts(last_name, first_name);

create index if not exists deals_updated_at_idx on deals(updated_at desc, id);
create index if not exists deals_pipeline_idx on deals(pipeline_id, stage_id);
create index if not exists deals_company_idx on deals(company);

create index if not exists tasks_due_idx on tasks(due_at asc);
create index if not exists tasks_owner_idx on tasks(owner);
`;

db.exec(indexStatements);

const ensureContactColumns = () => {
  try {
    db.prepare("alter table contacts add column title text").run();
  } catch (error) {
    if (!/duplicate column/i.test(String(error))) {
      console.warn("Unable to add contacts.title column:", error);
    }
  }
  try {
    db.prepare("alter table contacts add column address text").run();
  } catch (error) {
    if (!/duplicate column/i.test(String(error))) {
      console.warn("Unable to add contacts.address column:", error);
    }
  }
};

ensureContactColumns();
