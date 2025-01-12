const express = require("express");
const db = require("../connection");
const router = express.Router();

// Post route for creating a new event - POST /events
router.post("/", async (req, res) => {
  // Destructure data from request body
  const { event_name, description, organizer_name, organizer_email } = req.body;

  // Input validation
  if (!event_name || !description || !organizer_name || !organizer_email) {
    return res
      .status(400)
      .json({ error: "All fields required to create an event" });
  }

  try {
    const result = await db.query(
      "INSERT INTO events (event_name, description, organizer_name, organizer_email) VALUES ($1, $2, $3, $4) RETURNING *",
      [event_name, description, organizer_name, organizer_email]
    );
    const newEvent = result.rows[0];
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// GET route to fetch an event by ID - GET /events/:id

