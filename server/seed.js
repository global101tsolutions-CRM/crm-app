
import { db } from "./src/db.js";
import { nanoid } from "nanoid";

function seed() {
  const salesPipelineId = nanoid();
  const stages = [
    { name: "New", prob: 0.1 },
    { name: "Qualified", prob: 0.3 },
    { name: "Proposal", prob: 0.6 },
    { name: "Negotiation", prob: 0.8 },
    { name: "Won", prob: 1.0 },
    { name: "Lost", prob: 0.0 }
  ];
  db.prepare("insert into pipelines(id, name) values(?, ?)").run(salesPipelineId, "Sales Pipeline");
  stages.forEach((s, i) => {
    db.prepare("insert into stages(id, pipeline_id, name, order_index, probability) values(?,?,?,?,?)")
      .run(nanoid(), salesPipelineId, s.name, i, s.prob);
  });

  const cstmt = db.prepare("insert into contacts(id, first_name, last_name, email, phone, company) values(?,?,?,?,?,?)");
  const contacts = [
    ["Ava","Nowak","ava.nowak@example.com","+48 123 456 789","Acme"],
    ["Jan","Kowalski","jan.kowalski@example.com","+48 987 654 321","Globex"],
    ["Ola","Zielińska","ola.z@example.com","+48 555 222 111","Initech"]
  ];
  contacts.forEach(c => cstmt.run(nanoid(), ...c));

  const stageNew = db.prepare("select id from stages where name='New'").get().id;
  const dst = db.prepare("insert into deals(id,name,amount,pipeline_id,stage_id,company,owner) values(?,?,?,?,?,?,?)");
  dst.run(nanoid(), "Website redesign", 15000, salesPipelineId, stageNew, "Acme", "Ava");
  dst.run(nanoid(), "Annual subscription", 2400, salesPipelineId, stageNew, "Globex", "Jan");

  console.log("Seeded demo data.");
}

seed();
