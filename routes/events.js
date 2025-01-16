const express = require("express");
const crypto = require("crypto"); // Import crypto for unique URL generation
const db = require("../db/connection");
const router = express.Router();

// Function to generate a unique URL
function generateUniqueId() {
  return crypto.randomBytes(12).toString("hex");
}

// POST route for creating a new event - POST /api/events
router.post("/", async (req, res) => {
  const { event_name, description, organizer_name, organizer_email, time_slots } = req.body;

  // Input validation
  if (!event_name || !description || !organizer_name || !organizer_email || !Array.isArray(time_slots)) {
    console.error("POST /api/events - Missing or invalid fields:", req.body);
    return res.status(400).json({ error: "All fields are required to create an event." });
  }

  // Generate a unique URL
  const uniqueUrl = generateUniqueId();

  try {
    const result = await db.query(
      "INSERT INTO events (event_name, description, organizer_name, organizer_email, unique_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [event_name, description, organizer_name, organizer_email, uniqueUrl]
    );

    const newEvent = result.rows[0];
    const event_id = newEvent.event_id;

    // Validate and insert time slots
    const timeSlotPromises = time_slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      if (!start_time || !end_time) {
        throw new Error("Invalid time slot structure.");
      }
      const slotResult = await db.query(
        "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING time_slot_id, start_time, end_time",
        [event_id, start_time, end_time]
      );
      return slotResult.rows[0];
    });

    const insertedTimeSlots = await Promise.all(timeSlotPromises);

    console.log("POST /api/events - Event Created Successfully:", newEvent);
    res.status(201).json({
      ...newEvent,
      uniqueUrl: `${req.protocol}://${req.get("host")}/events/${uniqueUrl}`,
      time_slots: insertedTimeSlots,
    });
  } catch (error) {
    console.error("POST /api/events - Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route to fetch an event by its unique URL - GET /api/events/:uniqueUrl
router.get("/:uniqueUrl", async (req, res) => {
  const { uniqueUrl } = req.params;

  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events WHERE unique_url = $1",
      [uniqueUrl]
    );

    if (result.rows.length === 0) {
      console.error("GET /api/events/:uniqueUrl - Event Not Found:", uniqueUrl);
      return res.status(404).json({ error: "Event not found." });
    }

    const timeSlotsResult = await db.query(
      "SELECT time_slot_id, start_time, end_time FROM time_slots WHERE event_id = $1",
      [result.rows[0].id]
    );

    result.rows[0].time_slots = timeSlotsResult.rows;

    console.log("GET /api/events/:uniqueUrl - Event Fetched Successfully:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/events/:uniqueUrl - Error fetching event:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route for all events - GET /api/events
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events");
    if (result.rows.length === 0) {
      console.error("GET /api/events - No events found");
      return res.status(404).json({ error: "No events found." });
    }
    console.log("GET /api/events - Events Fetched Successfully:", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET /api/events - Error fetching events:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT route for updating event details - PUT /api/events/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { event_name, description, time_slots } = req.body;

  if (!event_name || !description || !Array.isArray(time_slots)) {
    console.error("PUT /api/events/:id - Missing or invalid fields:", req.body);
    return res.status(400).json({ error: "All fields needed to update the event." });
  }

  try {
    const result = await db.query(
      "UPDATE events SET event_name = $1, description = $2 WHERE event_id = $3 RETURNING *",
      [event_name, description, id]
    );

    if (result.rows.length === 0) {
      console.error("PUT /api/events/:id - Event Not Found for Update:", id);
      return res.status(404).json({ error: "Event not found." });
    }

    await db.query("DELETE FROM time_slots WHERE event_id = $1", [id]);

    const timeSlotPromises = time_slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      if (!start_time || !end_time) {
        throw new Error("Invalid time slot structure.");
      }
      return db.query(
        "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING time_slot_id, start_time, end_time",
        [id, start_time, end_time]
      );
    });

    const updatedTimeSlots = await Promise.all(timeSlotPromises);

    console.log("PUT /api/events/:id - Event Updated Successfully:", result.rows[0]);
    res.status(200).json({ ...result.rows[0], time_slots: updatedTimeSlots });
  } catch (error) {
    console.error("PUT /api/events/:id - Error updating event:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
