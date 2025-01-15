const express = require("express");
const db = require('../db/connection');
const router = express.Router();

// Post route for creating a new event - POST /events
router.post("/", async (req, res) => {
  const { name, description, timeSlots } = req.body;

  // Input validation
  if (!name || !description || !timeSlots) {
    console.error("POST /events - Missing fields:", req.body);
    return res
      .status(400)
      .json({ error: "All fields are required to create an event." });
  }

  try {
    const result = await db.query(
      "INSERT INTO events (event_name, description, time_slots) VALUES ($1, $2, $3) RETURNING *",
      [name, description, timeSlots]
    );
    const newEvent = result.rows[0];
    console.log("POST /events - Event Created Successfully:", newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("POST /events - Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// GET route to fetch an event by ID - GET /events/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

// log incoming request
  console.log("GET /events/:id - Event ID:", id);

  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description, time_slots AS timeSlots FROM events WHERE event_id = $1", 
      [id]
    );

    if (result.rows.length === 0) {
      console.error("GET /events/:id - Event Not Found:", id);
      return res.status(404).json({ error: "Sorry, event not found." });
    }
    console.log("GET /events/:id - Event Fetched Successfully:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET /events/:id - Error fetching event:", error);
    res.status(500).json({ error: "Unfortunate Server Error" });
  }
});

// GET route to fetch all events
router.get("/", async (req, res) => {

  // log start of request
  console.log("GET /events - Fetching all events");


  try {
    const result = await db.query("SELECT event_id AS id, event_name AS name, description, time_slots AS timeSlots FROM events");

    if (result.rows.length === 0) {
      console.error("GET /events - No events found");
      return res.status(404).json({ error: "No events found." });
    }
    console.log("GET /events - Events Fetched Successfully:", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET /events - Error fetching events:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// PUT route for updating event details
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, timeSlots } = req.body;

// log incoming request and body
  console.log("PUT /events/:id - Event ID:", id);
  console.log("PUT /events/:id - Request Body:", req.body);

  // Input validation
  if (!name || !description || !timeSlots) {
    console.error("PUT /events/:id - Missing fields:", req.body);
    return res.status(400).json({ error: "All fields needed to update event." });
  }

  try {
    const result = await db.query(
      "UPDATE events SET event_name = $1, description = $2, time_slots = $3 WHERE event_id = $4 RETURNING *",
      [name, description, timeSlots, id]
    );

    if (result.rows.length === 0) {
      console.error("PUT /events/:id - Event Not Found for Update:", id);
      return res.status(404).json({ error: "Event not found." });
    }
    
    console.log("PUT /events/:id - Event Updated Successfully:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("PUT /events/:id - Error updating event:", error);
    res.status(500).json({ error: "There has been a server error" });
  }
});

module.exports = router;
