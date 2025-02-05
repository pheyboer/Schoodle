const express = require("express");
const crypto = require("crypto"); // crypto module for unique url
const db = require("../db/connection");
const router = express.Router();

// Function to generate a unique URL
function generateUniqueId() {
  return crypto.randomBytes(12).toString("hex");
}

// Middleware for validating request body
const validateEventRequest = (req, res, next) => {
  const { event_name, description, organizer_name, organizer_email, time_slots } = req.body;

  if (!event_name || !description || !organizer_name || !organizer_email || !Array.isArray(time_slots)) {
    return res.status(400).json({
      error: "Missing required fields or invalid time_slots format.",
    });
  }

  if (time_slots.some(slot => !slot.start_time || !slot.end_time)) {
    return res.status(400).json({
      error: "Each time slot must have start_time and end_time.",
    });
  }

  next();
};

// POST route for creating a new event - POST /events
router.post("/", validateEventRequest, async (req, res) => {
  const { event_name, description, organizer_name, organizer_email, time_slots } = req.body;
  const uniqueUrl = generateUniqueId();

  console.log("POST /events - Request Body:", req.body); // Log the request body

  if (!event_name || !description || !organizer_name || !organizer_email || !time_slots) {
    return res.status(400).json({ error: "All fields are required to create an event." });
  }

  try {
    const result = await db.query(
      "INSERT INTO events (event_name, description, organizer_name, organizer_email, unique_url) VALUES ($1, $2, $3, $4, $5) RETURNING *", // Changed to RETURNING *
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
      event_id: event_id,
      event_name: newEvent.event_name,
      description: newEvent.description,
      organizer_name: newEvent.organizer_name,
      organizer_email: newEvent.organizer_email,
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

    // Added query for attendees
    const attendeesResult = await db.query(
      "SELECT DISTINCT name, email FROM attendees WHERE event_id = $1",
      [result.rows[0].id]
    );

    result.rows[0].time_slots = timeSlotsResult.rows;
    result.rows[0].attendees = attendeesResult.rows;

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

    // Add query for attendees
    const attendeesResult = await db.query(
      "SELECT DISTINCT name, email FROM attendees WHERE event_id = $1",
      [event.id]
    );

    event.time_slots = timeSlotsResult.rows;
    event.attendees = attendeesResult.rows;

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

// DELETE route for deleting an event - DELETE /events/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Start a transaction to ensure all related data is deleted
    await db.query('BEGIN');

    // Delete related availability responses first
    await db.query(
      "DELETE FROM availability_responses WHERE event_id = $1",
      [id]
    );

    // Delete related time slots
    await db.query(
      "DELETE FROM time_slots WHERE event_id = $1",
      [id]
    );

    // Delete attendees
    await db.query(
      "DELETE FROM attendees WHERE event_id = $1",
      [id]
    );

    // Finally, delete the event
    const result = await db.query(
      "DELETE FROM events WHERE event_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: "Event not found" });
    }

    // Commit the transaction
    await db.query('COMMIT');

    res.status(200).json({ message: "Event and all related data deleted successfully" });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
