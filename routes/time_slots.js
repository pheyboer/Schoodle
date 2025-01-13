const express = require("express");
const db = require("../connection");
const router = express.Router();

// POST route  for creating a new time slot for an event /time_slots
router.post("/", async (req, res) => {
  const { event_id, start_time, end_time } = req.body;

  // Input validation
  if (!event_id || !start_time || !end_time) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO time_slots (event_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *",
      [event_id, start_time, end_time]
    );

    const newTimeSlot = result.rows[0];
    res.status(201).json(newTimeSlot); // Returns new time slot
  } catch (error) {
    console.error("Error Creating Time Slot:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET route to get time slot by its ID - GET /time_slots/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM time_slots WHERE time_slot_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Time slot not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching time slot", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET route for fetching time slots for event /time_slots/:eventId
router.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM time_slots WHERE event_id = $1",
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No time slot for this event" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching time slots", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT route to update time slot - PUT /time_slots/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res
      .status(400)
      .json({ error: "Start and End time required to update" });
  }

  try {
    const result = await db.query(
      "UPDATE time_slots SET start_time = $1, end_time = $2 WHERE time_slot_id = $3 RETURNING *",
      [start_time, end_time, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Time slot not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating time slot", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// DELETE route to delete time slot by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM time_slots WHERE time_slot_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Time slot not found" });
    }

    res.status(200).json({ message: "Time slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting time slot", error);
    res.status(500).json({ error: "Server Error" });
  }
});
