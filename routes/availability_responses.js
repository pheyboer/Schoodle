const express = require("express");
const db = require("../db/connection");
const router = express.Router();

// POST route to add a new availability response - POST /availability_responses
router.post("/", async (req, res) => {
  const { attendee_id, time_slot_id, event_id, availability } = req.body;

  if (!attendee_id || !time_slot_id || !event_id || typeof availability !== "boolean") {
    return res.status(400).json({ error: "All fields are required and 'availability' must be true or false." });
  }

  try {
    const result = await db.query(
      `INSERT INTO availability_responses (attendee_id, time_slot_id, event_id, availability)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [attendee_id, time_slot_id, event_id, availability]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating availability response:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route to view responses for ID (for organizer) - GET /availability_responses/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM availability_responses WHERE response_id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Availability response not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching availability response:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT route to update existing availability response - PUT /availability_responses/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { attendee_id, time_slot_id, event_id, availability } = req.body;

  if (!attendee_id || !time_slot_id || !event_id || typeof availability !== "boolean") {
    return res.status(400).json({ error: "All fields are required and 'availability' must be true or false." });
  }

  try {
    const result = await db.query(
      `UPDATE availability_responses
       SET attendee_id = $1, time_slot_id = $2, event_id = $3, availability = $4
       WHERE response_id = $5 RETURNING *`,
      [attendee_id, time_slot_id, event_id, availability, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Availability response not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating availability response:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route to view all availability responses - GET /availability_responses
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM availability_responses");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No availability responses found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching availability responses:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE route to delete a specific availability response - DELETE /availability_responses/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM availability_responses WHERE response_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Availability response not found." });
    }

    res.status(200).json({ message: "Availability response deleted successfully." });
  } catch (error) {
    console.error("Error deleting availability response:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
