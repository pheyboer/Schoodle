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
