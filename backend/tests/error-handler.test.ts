import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import express from "express";
import request from "supertest";

import { AppError } from "../src/shared/errors/app-error.js";
import { errorHandler } from "../src/shared/middlewares/error-handler.js";
import { notFoundHandler } from "../src/shared/middlewares/not-found-handler.js";

function createTestApp() {
  const app = express();

  app.use(express.json());

  app.get("/test-app-error", (_request, _response, next) => {
    next(new AppError("Test application error.", 418));
  });

  app.get("/test-internal-error", () => {
    throw new Error("Sensitive internal database details.");
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

describe("HTTP Error Handling", () => {
  const app = createTestApp();
  const originalConsoleError = console.error;

  after(() => {
    console.error = originalConsoleError;
  });

  it("returns the status and message of an AppError", async () => {
    const response = await request(app)
      .get("/test-app-error")
      .expect(418);

    assert.deepEqual(response.body, {
      success: false,
      message: "Test application error.",
    });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await request(app)
      .get("/route-that-does-not-exist")
      .expect(404);

    assert.equal(response.body.success, false);
    assert.equal(
      response.body.message,
      "Route not found: GET /route-that-does-not-exist",
    );
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/test-json")
      .set("Content-Type", "application/json")
      .send('{"firstName":')
      .expect(400);

    assert.deepEqual(response.body, {
      success: false,
      message: "Invalid JSON in request body.",
    });
  });

  it("hides internal error details from the client", async () => {
    console.error = () => {};

    const response = await request(app)
      .get("/test-internal-error")
      .expect(500);

    assert.deepEqual(response.body, {
      success: false,
      message: "An unexpected server error occurred.",
    });

    assert.equal(
      JSON.stringify(response.body).includes(
        "Sensitive internal database details.",
      ),
      false,
    );
  });
});
