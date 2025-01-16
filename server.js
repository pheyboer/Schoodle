// load .env data into process.env
require("dotenv").config();

// Web server config
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const morgan = require("morgan");
const db = require("./db/connection"); // Import the database connection

const PORT = process.env.PORT || 8080;
const app = express();

app.set("view engine", "ejs");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static file middleware
app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static("public"));

// Validate database connection on startup
db.query("SELECT NOW()")
  .then(() => console.log("Database connected successfully."))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit the application if the database is not connected
  });

// Separated Routes for each Resource
const userApiRoutes = require("./routes/users-api");
const eventsApiRoutes = require("./routes/events"); // Event API route
const timeSlotApiRoutes = require("./routes/time_slots"); // Time slot API route
const attendeeRoutes = require("./routes/attendees"); // Attendee API route
const availabilityResponseRoutes = require("./routes/availability_responses"); // Availability response API

// Mount all resource routes
app.use("/api/users", userApiRoutes); // Example route
app.use("/api/events", eventsApiRoutes); // Event creation and fetching
app.use("/api/time_slots", timeSlotApiRoutes); // Time slot management
app.use("/api/attendees", attendeeRoutes); // Attendee data
app.use("/api/availability_responses", availabilityResponseRoutes); // Availability submissions

console.log(
  "Routes connected: /api/events, /api/time_slots, /api/attendees, /api/availability_responses"
);

// **Add Global Error Handling Middleware**
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Internal server error. Please try again later." });
});

// Home page route
app.get("/", (req, res) => {
  res.render("index"); // Render the home page
  console.log("GET / - Rendered index page.");
});

// **Database Connection Test Endpoint**
app.get("/test-db", async (req, res) => {
  try {
    const testQuery = await db.query("SELECT NOW()");
    console.log("Database connection test successful.");
    res.status(200).json({ message: "Database connected", time: testQuery.rows[0] });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
