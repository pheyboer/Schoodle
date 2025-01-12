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
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM events WHERE event_id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(500).json({ error: "Unfortunate Server Error" });
  }
});

// GET route to fetch all events
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// PUT route for updating event details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { event_name, description, organizer_name, organizer_email } = req.body;

  // Input validation
  if (!event_name || !description || !organizer_name || !organizer_email) {
    return res.status(400).json({ error: "All fields needed to update event." });
  }

  try {
    const result = await db.query(
      "UPDATE events SET event_name = $1, description = $2, organizer_name = $3, organizer_email = $4 WHERE event_id = $5 RETURNING *",
      [event_name, description, organizer_name, organizer_email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error Updating Event", error);
    res.status(500).json({ error: "There has been a server error" });
  }
});

module.exports = router;
