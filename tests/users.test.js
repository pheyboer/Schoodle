
const request = require("supertest");
const { app, server } = require("../server");
const db = require("../db/connection");

jest.mock("../db/connection");

describe("Users API", () => {
  afterAll(async () => {
    await server.close();
    await db.end();
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return a list of users", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { user_id: 1, name: "John Doe", email: "john@example.com" },
          { user_id: 2, name: "Jane Smith", email: "jane@example.com" },
        ],
      });

      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user and return 201", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, name: "John Doe", email: "john@example.com" }],
      });

      const response = await request(app).post("/api/users").send({
        name: "John Doe",
        email: "john@example.com",
      });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("John Doe");
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app).post("/api/users").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Name and email are required");
    });
  });
});
