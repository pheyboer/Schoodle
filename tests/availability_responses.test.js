const request = require("supertest");
const { app, server } = require("../server");
const db = require("../db/connection");

jest.mock("../db/connection");

describe("Attendee Responses API", () => {
  afterAll(async () => {
    await server.close();
    await db.end();
    jest.clearAllMocks();
  });

  describe("POST /availability_responses", () => {
    it("should create a response and return 201", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ response_id: 1, attendee_id: 1, time_slot_id: 1, availability: true }],
      });

      const response = await request(app)
        .post("/availability_responses")
        .send({
          name: "John Doe",
          email: "john@example.com",
          attendee_id: 1,
          time_slot_id: 1,
          availability: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.response_id).toBe(1);
    });

    it("should return 400 if fields are missing", async () => {
      const response = await request(app).post("/availability_responses").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required fields");
    });
  });

  describe("GET /availability_responses/:id", () => {
    it("should return a response by ID", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ response_id: 1, attendee_id: 1, time_slot_id: 1, availability: true }],
      });

      const response = await request(app).get("/availability_responses/1");

      expect(response.status).toBe(200);
      expect(response.body.response_id).toBe(1);
      expect(response.body.availability).toBe(true);
    });

    it("should return 404 if response is not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get("/availability_responses/999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Response not found");
    });
  });
});
