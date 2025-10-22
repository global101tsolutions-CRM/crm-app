import request from "supertest";

import app from "../src/app.js";
import { db } from "../src/db.js";

describe("API health check", () => {
  it("responds with ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
  });
});

describe("Contacts API", () => {
  it("returns paginated contacts sorted by first name", async () => {
    const res = await request(app)
      .get("/api/contacts")
      .query({ limit: 1, sort: "first_name", order: "asc" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].first_name).toBe("Ava");
  });

  it("rejects contact creation without a name", async () => {
    const res = await request(app).post("/api/contacts").send({
      email: "invalid@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/needs at least a first or last name/i);
  });

  it("creates a contact with trimmed fields", async () => {
    const res = await request(app).post("/api/contacts").send({
      first_name: "  Chris ",
      last_name: "  Ray  ",
      email: "chris@example.com",
      title: "  VP Sales ",
      address: "  10 Downing St ",
      phone: "123456789",
      company: "Testers Ltd"
    });

    expect(res.status).toBe(200);
    expect(res.body.data.first_name).toBe("Chris");
    expect(res.body.data.last_name).toBe("Ray");
    expect(res.body.data.title).toBe("VP Sales");
    expect(res.body.data.address).toBe("10 Downing St");
    const row = db
      .prepare("select * from contacts where email = ?")
      .get("chris@example.com");
    expect(row.first_name).toBe("Chris");
    expect(row.last_name).toBe("Ray");
    expect(row.title).toBe("VP Sales");
    expect(row.address).toBe("10 Downing St");
  });
});

describe("Deals API", () => {
  it("rejects deals without a name", async () => {
    const res = await request(app).post("/api/deals").send({
      amount: 1000,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/deal name is required/i);
  });
});

describe("Companies API", () => {
  it("returns aggregated company data", async () => {
    const res = await request(app).get("/api/companies/acme%20inc.");

    expect(res.status).toBe(200);
    expect(res.body.data.summary.name).toBe("Acme Inc.");
    expect(res.body.data.summary.contactsCount).toBeGreaterThan(0);
    expect(res.body.data.summary.pipelineValue).toBeGreaterThan(0);
    expect(res.body.data.deals[0].company).toBe("Acme Inc.");
    expect(Array.isArray(res.body.data.contacts)).toBe(true);
  });
});
