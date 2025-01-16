const express = require("express");
const db = require("../db/connection");
const router = express.Router();

// POST route to submit availability - POST /availability_responses
router.post("/", async (req, res) => {
  console.log('Received request body:', req.body); // Debug logging
  const { name, email, timeSlots, event_id } = req.body;  // Add email to destructuring

  if (!name || !email || !Array.isArray(timeSlots) || timeSlots.length === 0 || !event_id) {
    return res.status(400).json({ error: "Name, email, event ID, and at least one time slot are required." });
  }

  try {
    // Start a transaction
    await db.query('BEGIN');

    // Create attendee with required fields according to schema
    const attendeeResult = await db.query(
      "INSERT INTO attendees (name, email, event_id) VALUES ($1, $2, $3) RETURNING *",
      [name, email, event_id]  // Use the email from the request
    );

    const attendee = attendeeResult.rows[0];
    console.log('Created attendee with ID:', attendee.attendee_id); // Debug logging can take out later

    // Insert availability responses
    for (const timeSlotId of timeSlots) {
      await db.query(
        "INSERT INTO availability_responses (attendee_id, time_slot_id, event_id) VALUES ($1, $2, $3)",
        [attendee.attendee_id, timeSlotId, event_id]
      );
    }

    // Commit the transaction
    await db.query('COMMIT');

    // Return the created attendee info
    res.status(201).json({
      message: "Availability submitted successfully!",
      attendee: {
        name: attendee.name,
        email: attendee.email
      }
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error("Error submitting availability:", error.message); // Detailed error logging

    if (error.constraint) {
      // Handle specific database constraint violations
      res.status(400).json({
        error: "Database constraint violation",
        details: error.detail
      });
    } else {
      res.status(500).json({
        error: "Server error",
        details: error.message
      });
    }
  }
});

// GET route to view responses for ID (for organizer) - GET /availability_responses/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM availability_responses WHERE response_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Availability response not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT route to update existing availability response - PUT /availability_responses/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { attendee_id, time_slot_id, event_id } = req.body;

  if (!attendee_id || !time_slot_id || !event_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await db.query(
      `UPDATE availability_responses
       SET attendee_id = $1, time_slot_id = $2, event_id = $3
       WHERE response_id = $4 RETURNING *`,
      [attendee_id, time_slot_id, event_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Availability response not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
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
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE route to delete a specific availability response - DELETE /availability_responses/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM availability_responses WHERE response_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Availability response not found." });
    }

    res.status(200).json({ message: "Availability response deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
