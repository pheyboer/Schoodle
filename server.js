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
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const userApiRoutes = require("./routes/users-api");
const widgetApiRoutes = require("./routes/widgets-api");
const usersRoutes = require("./routes/users");
const eventsApiRoutes = require("./routes/events"); // Event API route
const timeSlotApiRoutes = require("./routes/time_slots"); // Time slot API route
const attendeeRoutes = require("./routes/attendees"); // Attendee API route
const availabilityResponseRoutes = require("./routes/availability_responses"); // Availability response API

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// Note: Endpoints that return data (eg. JSON) usually start with `/api`
app.use("/api/users", userApiRoutes);
app.use("/api/widgets", widgetApiRoutes);
app.use("/users", usersRoutes);
app.use("/api/events", eventsApiRoutes);
// Note: mount other resources here, using the same pattern above
app.use("/api/time_slots", timeSlotApiRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/availability_responses", availabilityResponseRoutes);

console.log("Routes connected: /api/events, /api/time_slots, /api/attendees, /api/availability_responses");


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {
  res.render("index");
});

// connection test
app.get("/test-db", async (req, res) => {
  try {
    const testQuery = await db.query("SELECT NOW()");
    res.status(200).json({ message: "Database connected", time: testQuery.rows[0] });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
