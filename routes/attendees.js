const express = require('express');
const router = express.Router();
const db = require('../db/connection');


// POST route to create new attendee POST /attendees
router.post("/", async (req, res) => {
  const { event_id, name, email } = req.body;

  // Input validation
  if(!event_id || !name || !email) {
    return res.status(400).json({ error: "Event ID, name, and email are all required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO attendees (event_id, name, email) VALUES $1, $2, $3 RETURNING *",
      [event_id, name, email]
    );
    const newAttendee = result.rows[0];
    res.status(201).json(newAttendee);
  } catch (error) {
    console.error("Error creating attendee", error);
    res.status(500).json({ error: "Server Error" });
  }
});
