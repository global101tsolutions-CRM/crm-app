process.env.NODE_ENV = "test";
process.env.DB_PATH = ":memory:";
process.env.LOG_LEVEL = "silent";

const { beforeAll, afterEach } = await import("vitest");
const { db } = await import("../src/db.js");
const { nanoid } = await import("nanoid");

const resetDatabase = () => {
  db.exec(`
    delete from tasks;
    delete from deals;
    delete from stages;
    delete from pipelines;
    delete from contacts;
  `);
};

const seedDatabase = () => {
  const pipelineId = nanoid();
  db.prepare("insert into pipelines(id, name) values(?, ?)").run(
    pipelineId,
    "Sales Pipeline"
  );

  const stageInsert = db.prepare(
    "insert into stages(id, pipeline_id, name, order_index, probability) values(?,?,?,?,?)"
  );
  const stageNames = ["New", "Qualified", "Proposal", "Negotiation"];
  const stageMap = {};
  stageNames.forEach((name, index) => {
    const id = nanoid();
    stageMap[name] = id;
    stageInsert.run(id, pipelineId, name, index, 0.2 * (index + 1));
  });

  const contactInsert = db.prepare(
    "insert into contacts(id, first_name, last_name, email, phone, company) values(?,?,?,?,?,?)"
  );
  [
    ["Ava", "Nowak", "ava.nowak@example.com", "+48 123 456 789", "Acme Inc."],
    ["Jan", "Kowalski", "jan.kowalski@example.com", "+48 987 654 321", "Globex Corporation"],
    ["Ola", "Zielinska", "ola.z@example.com", "+48 555 222 111", "Initech"],
  ].forEach((contact) => contactInsert.run(nanoid(), ...contact));

  const dealInsert = db.prepare(
    "insert into deals(id, name, amount, pipeline_id, stage_id, company, owner) values(?,?,?,?,?,?,?)"
  );
  dealInsert.run(
    nanoid(),
    "Website redesign",
    40000,
    pipelineId,
    stageMap["Proposal"],
    "Acme Inc.",
    "Ava"
  );
  dealInsert.run(
    nanoid(),
    "Support renewal",
    25000,
    pipelineId,
    stageMap["Negotiation"],
    "Globex Corporation",
    "Jan"
  );

  const taskInsert = db.prepare(
    "insert into tasks(id, subject, due_at, related_type, related_id, owner, status) values(?,?,?,?,?,?,?)"
  );
  taskInsert.run(
    nanoid(),
    "Follow up with Acme",
    new Date().toISOString(),
    "company",
    "acme inc.",
    "Ava",
    "open"
  );
};

beforeAll(() => {
  resetDatabase();
  seedDatabase();
});

afterEach(() => {
  resetDatabase();
  seedDatabase();
});
