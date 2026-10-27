import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";

process.env.DB_SERVER ||= "localhost";
process.env.DB_NAME ||= "InsuranceManagement";
process.env.FRONTEND_URL = "http://localhost:5173";

const { default: app } = await import("../src/app.js");

test("applies Helmet security headers", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
});

test("allows the configured frontend origin", async () => {
  const response = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:5173");

  assert.equal(response.status, 200);
  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://localhost:5173",
  );
});

test("rejects customer data with blank required names", async () => {
  const response = await request(app)
    .post("/api/customers")
    .send({ firstName: " ", lastName: "" });

  assert.equal(response.status, 400);
});

test("rejects unexpected customer fields", async () => {
  const response = await request(app)
    .post("/api/customers")
    .send({
      firstName: "Test",
      lastName: "Customer",
      admin: true,
    });

  assert.equal(response.status, 400);
});

test("rejects malformed JSON", async () => {
  const response = await request(app)
    .post("/api/customers")
    .set("Content-Type", "application/json")
    .send('{"firstName":');

  assert.equal(response.status, 400);
});

test("returns 404 for an unknown API route", async () => {
  const response = await request(app).get("/api/not-a-real-route");

  assert.equal(response.status, 404);
});
