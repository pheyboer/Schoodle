const express = require('express');
const router = express.Router();
const db = require('../db/connection');


// POST route to create new attendee POST /attendees
router.post("/", async (req, res) => {
  console.log(req.body);
  const { event_id, name, email } = req.body;

  // Input validation
  if(!event_id || !name || !email) {
    return res.status(400).json({ error: "Event ID, name, and email are all required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO attendees (event_id, name, email) VALUES ($1, $2, $3) RETURNING *",
      [event_id, name, email]
    );
    const newAttendee = result.rows[0];
    res.status(201).json(newAttendee);
  } catch (error) {
    console.error("Error creating attendee", error);
    res.status(500).json({ error: "Server Error" });
  }
});


// GET route to get attendees for a given event GET /attendees/event/:eventId
router.get("/event/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await db.query("SELECT * FROM attendees WHERE event_id = $1", [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No attendees found for the event" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting attendees for event", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET route to get attendee by ID GET /attendees/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM attendees WHERE attendee_id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Attendee not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting attendee:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//PUT route for updating an attendee PUT /attendees/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { event_id, name, email } = req.body;

  // Input validation
  if (!event_id || !name || !email) {
    return res.status(400).json({ error: "Event ID, name, and email are required to update attendee." });
  }

  try {
    const result = await db.query(
      "UPDATE attendees SET event_id = $1, name = $2, email = $3 WHERE attendee_id = $4 RETURNING *",
      [event_id, name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Attendee not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating attendee:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
