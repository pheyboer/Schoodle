const express = require("express");
const crypto = require("crypto"); // crypto module for unique url
const db = require("../db/connection");
const router = express.Router();

// Function to generate a unique URL
function generateUniqueId() {
  return crypto.randomBytes(12).toString("hex");
}

// POST route for creating a new event - POST /events
router.post("/", async (req, res) => {
  const { event_name, description, organizer_name, organizer_email, time_slots } = req.body;

  console.log("POST /events - Request Body:", req.body); // Log the request body

  if (!event_name || !description || !organizer_name || !organizer_email || !time_slots) {
    return res.status(400).json({ error: "All fields are required to create an event." });
  }

  const uniqueUrl = generateUniqueId();

  try {
    const result = await db.query(
      "INSERT INTO events (event_name, description, organizer_name, organizer_email, unique_url) VALUES ($1, $2, $3, $4, $5) RETURNING event_id",
      [event_name, description, organizer_name, organizer_email, uniqueUrl]
    );

    const newEvent = result.rows[0];
    const event_id = newEvent.event_id;

    if (!Array.isArray(time_slots) || time_slots.some(slot => !slot.start_time || !slot.end_time)) {
      return res.status(400).json({ error: "Invalid time_slots format." });
    }

    const timeSlotPromises = time_slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      const slotResult = await db.query(
        "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING time_slot_id, start_time, end_time",
        [event_id, start_time, end_time]
      );
      return slotResult.rows[0];
    });

    const insertedTimeSlots = await Promise.all(timeSlotPromises);

    res.status(201).json({
      ...newEvent,
      uniqueUrl: `${req.protocol}://${req.get("host")}/events/${uniqueUrl}/respond`,
      time_slots: insertedTimeSlots,
    });

  } catch (error) {
    console.error("POST /events - Error creating event:", error); // Log the error
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// GET route to fetch an event by its unique URL - GET /events/:uniqueUrl
router.get("/:uniqueUrl", async (req, res) => {
  const { uniqueUrl } = req.params;

  if (!uniqueUrl) {
    return res.status(400).json({ error: "Unique URL is required." });
  }

  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events WHERE unique_url = $1",
      [uniqueUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    const timeSlotsResult = await db.query(
      "SELECT time_slot_id, start_time, end_time FROM time_slots WHERE event_id = $1",
      [result.rows[0].id]
    );

    result.rows[0].time_slots = timeSlotsResult.rows;

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Unfortunate Server Error" });
  }
});

// GET route to render event details and attendee response form - GET /events/:uniqueUrl/respond
router.get("/:uniqueUrl/respond", async (req, res) => {
  const { uniqueUrl } = req.params;

  if (!uniqueUrl) {
    return res.status(400).json({ error: "Unique URL is required." });
  }

  try {
    const eventResult = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events WHERE unique_url = $1",
      [uniqueUrl]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    const event = eventResult.rows[0];

    const timeSlotsResult = await db.query(
      "SELECT time_slot_id, start_time, end_time FROM time_slots WHERE event_id = $1",
      [event.id]
    );

    event.time_slots = timeSlotsResult.rows;

    res.render("event_details", { event });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route to fetch an event by ID - GET /events/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Event ID is required." });
  }

  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events WHERE event_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    const timeSlotsResult = await db.query(
      "SELECT time_slot_id, start_time, end_time FROM time_slots WHERE event_id = $1",
      [id]
    );

    result.rows[0].time_slots = timeSlotsResult.rows;

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Unfortunate Server Error" });
  }
});

// GET route to fetch all events
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No events found." });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// PUT route for updating event details - PUT /events/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { event_name, description, time_slots } = req.body;

  if (!event_name || !description || !time_slots) {
    return res.status(400).json({ error: "All fields needed to update event." });
  }

  try {
    const result = await db.query(
      "UPDATE events SET event_name = $1, description = $2 WHERE event_id = $3 RETURNING *",
      [event_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    await db.query(
      "DELETE FROM time_slots WHERE event_id = $1",
      [id]
    );

    const timeSlotPromises = time_slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      return db.query(
        "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING time_slot_id, start_time, end_time",
        [id, start_time, end_time]
      );
    });

    await Promise.all(timeSlotPromises);

    res.status(200).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
