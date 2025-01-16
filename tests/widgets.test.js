
const request = require("supertest");
const { app, server } = require("../server");
const db = require("../db/connection");

jest.mock("../db/connection");

describe("Widgets API", () => {
  afterAll(async () => {
    await server.close();
    await db.end();
    jest.clearAllMocks();
  });

  describe("GET /api/widgets", () => {
    it("should return a list of widgets", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { widget_id: 1, name: "Widget A", description: "First widget" },
          { widget_id: 2, name: "Widget B", description: "Second widget" },
        ],
      });

      const response = await request(app).get("/api/widgets");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("POST /api/widgets", () => {
    it("should create a new widget and return 201", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ widget_id: 1, name: "Widget A", description: "First widget" }],
      });

      const response = await request(app).post("/api/widgets").send({
        name: "Widget A",
        description: "First widget",
      });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Widget A");
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app).post("/api/widgets").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Name and description are required");
    });
  });
});
