
const request = require("supertest");
const { app, server } = require("../server");
const db = require("../db/connection");

jest.mock("../db/connection");

describe("Time Slots API", () => {
  afterAll(async () => {
    await server.close();
    await db.end();
    jest.clearAllMocks();
  });

  describe("POST /time_slots", () => {
    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/time_slots").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("All fields required");
    });
  });

  describe("GET /time_slots/:id", () => {
    it("should return a time slot by ID", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ time_slot_id: 1, start_time: "2025-01-16T10:00:00Z", end_time: "2025-01-16T11:00:00Z" }],
      });

      const response = await request(app).get("/time_slots/1");
      expect(response.status).toBe(200);
      expect(response.body.start_time).toBe("2025-01-16T10:00:00Z");
    });

    it("should return 404 if time slot is not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get("/time_slots/999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Time slot not found");
    });
  });
});