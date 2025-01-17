const request = require("supertest");
const { app, server } = require("../server");
const db = require("../db/connection");

jest.mock("../db/connection");

describe("Events API", () => {
  afterAll(() => {
    server.close();
    jest.clearAllMocks();
  });

  describe("POST /events", () => {
    it("should create an event and return 201 with event details", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            event_id: 1,
            event_name: "Test Event",
            description: "Description",
            organizer_name: "Organizer",
            organizer_email: "test@example.com",
            unique_url: "testurl",
          },
        ],
      });
      db.query.mockResolvedValueOnce({
        rows: [
          { time_slot_id: 1, start_time: "2025-01-16T10:00:00Z", end_time: "2025-01-16T11:00:00Z" },
        ],
      });

      const response = await request(app)
        .post("/events")
        .send({
          event_name: "Test Event",
          description: "Description",
          organizer_name: "Organizer",
          organizer_email: "test@example.com",
          time_slots: [
            { start_time: "2025-01-16T10:00:00Z", end_time: "2025-01-16T11:00:00Z" },
          ],
        });

      console.log(response.body); // Debugging response body

      expect(response.status).toBe(201);
      expect(response.body.event_name).toBe("Test Event"); // Adjusted expectation
    });
  });

  describe("GET /events/:uniqueUrl", () => {
    it("should return event details for a valid uniqueUrl", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Test Event", description: "Description" }],
      });
      db.query.mockResolvedValueOnce({
        rows: [
          { time_slot_id: 1, start_time: "2025-01-16T10:00:00Z", end_time: "2025-01-16T11:00:00Z" },
        ],
      });

      const response = await request(app).get("/events/testurl");

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Test Event");
    });

    it("should return 404 if event not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get("/events/invalidurl");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Sorry, event not found.");
    });
  });
});
