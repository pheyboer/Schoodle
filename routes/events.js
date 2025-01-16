const express = require("express");
const crypto = require("crypto"); // crypto module for unique url
const db = require("../db/connection");
const router = express.Router();

// Function to generate a unique URL
function generateUniqueId() {
  return crypto.randomBytes(12).toString("hex");
}

// Post route for creating a new event - POST /events
router.post("/", async (req, res) => {
  const { event_name, description, organizer_name, organizer_email, time_slots } = req.body;

  // Input validation
  if (!event_name || !description || !organizer_name || !organizer_email || !time_slots) {
    console.error("POST /events - Missing fields:", req.body);
    return res
      .status(400)
      .json({ error: "All fields are required to create an event." });
  }

  // generate unique url
  const uniqueUrl = generateUniqueId();

  try {
    const result = await db.query(
      "INSERT INTO events (event_name, description, organizer_name, organizer_email, unique_url) VALUES ($1, $2, $3, $4, $5) RETURNING event_id",
      [event_name, description, organizer_name, organizer_email, uniqueUrl]
    );

    const newEvent = result.rows[0];
    const event_id = newEvent.event_id; // Get the event_id of the newly created event

    // Insert time slots for the event into the time_slots table
    const timeSlotPromises = time_slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      // Insert the time slot with the associated event_id
      const slotResult = await db.query(
        "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING time_slot_id, start_time, end_time",
        [event_id, start_time, end_time]
      );
      return slotResult.rows[0];
    });

    // Wait for all time slots to be inserted
    const insertedTimeSlots = await Promise.all(timeSlotPromises);

    console.log("POST /events - Event Created Successfully:", newEvent);
    res.status(201).json({
      ...newEvent,
      uniqueUrl: `${req.protocol}://${req.get("host")}/events/${uniqueUrl}`,
      time_slots: insertedTimeSlots, // Include the time slots with their time_slot_id
    });
  } catch (error) {
    console.error("POST /events - Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET route to fetch an event by its unique URL - GET /events/:uniqueUrl
router.get("/:uniqueUrl", async (req, res) => {
  const { uniqueUrl } = req.params;

  console.log("GET /events/:uniqueUrl - Unique URL:", uniqueUrl);

  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events WHERE unique_url = $1",
      [uniqueUrl]
    );

    if (result.rows.length === 0) {
      console.error("GET /events/:uniqueUrl - Event Not Found:", uniqueUrl);
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    const timeSlotsResult = await db.query(
      "SELECT time_slot_id, start_time, end_time FROM time_slots WHERE event_id = $1",
      [result.rows[0].id]
    );

    result.rows[0].time_slots = timeSlotsResult.rows;

    console.log("GET /events/:uniqueUrl - Event Fetched Successfully:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET /events/:uniqueUrl - Error fetching event:", error);
    res.status(500).json({ error: "Unfortunate Server Error" });
  }
});

// GET route to fetch an event by ID - GET /events/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // log incoming request
  console.log("GET /events/:id - Event ID:", id);

  try {
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description FROM events WHERE event_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      console.error("GET /events/:id - Event Not Found:", id);
      return res.status(404).json({ error: "Sorry, event not found." });
    }

    const timeSlotsResult = await db.query(
      "SELECT time_slot_id, start_time, end_time FROM time_slots WHERE event_id = $1",
      [id]
    );

    result.rows[0].time_slots = timeSlotsResult.rows;

    console.log(
      "GET /events/:id - Event Fetched Successfully:",
      result.rows[0]
    );
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
    const result = await db.query(
      "SELECT event_id AS id, event_name AS name, description, time_slots AS timeSlots FROM events"
    );

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

// PUT route for updating event details - PUT /events/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { event_name, description, time_slots } = req.body;

  console.log("PUT /events/:id - Event ID:", id);
  console.log("PUT /events/:id - Request Body:", req.body);

  // Input validation

  if (!event_name || !description || !time_slots) {

    console.error("PUT /events/:id - Missing fields:", req.body);
    return res
      .status(400)
      .json({ error: "All fields needed to update event." });
  }

  try {

    // updating event details

    const result = await db.query(
      "UPDATE events SET event_name = $1, description = $2 WHERE event_id = $3 RETURNING *",
      [event_name, description, id]
    );

    if (result.rows.length === 0) {
      console.error("PUT /events/:id - Event Not Found for Update:", id);
      return res.status(404).json({ error: "Event not found." });
    }

    // Update time slots for the event
    // Delete the existing time slots
    const deleteSlotsResult = await db.query(
      "DELETE FROM time_slots WHERE event_id = $1",
      [id]
    );

    // Insert the new time slots
    const timeSlotPromises = time_slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      return db.query(
        "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING time_slot_id, start_time, end_time",
        [id, start_time, end_time]
      );
    });

    await Promise.all(timeSlotPromises);

    console.log(
      "PUT /events/:id - Event Updated Successfully:",
      result.rows[0]
    );
    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("PUT /events/:id - Error updating event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
