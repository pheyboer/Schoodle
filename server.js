// Load .env data into process.env
require("dotenv").config();

// Web server config
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const morgan = require("morgan");
const db = require("./db/connection"); 

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


db.query("SELECT NOW()")
  .then(() => console.log("Database connected successfully."))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); 
  });

// Separated Routes for each Resource
const userApiRoutes = require("./routes/users-api");
const eventsApiRoutes = require("./routes/events"); 
const timeSlotApiRoutes = require("./routes/time_slots"); 
const attendeeRoutes = require("./routes/attendees"); 
const availabilityResponseRoutes = require("./routes/availability_responses"); 

// Mount all resource routes
app.use("/api/users", userApiRoutes); 
app.use("/api/events", eventsApiRoutes); 
app.use("/api/time_slots", timeSlotApiRoutes); 
app.use("/api/attendees", attendeeRoutes); 
app.use("/api/availability_responses", availabilityResponseRoutes); 

// Highlighting connected routes
console.log(
  "Routes connected: /api/events, /api/time_slots, /api/attendees, /api/availability_responses"
);

// Add Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Internal server error. Please try again later." });
});

// Home page route
app.get("/", (req, res) => {
  res.render("index"); 
  console.log("GET / - Rendered index page.");
});

// Database Connection Test Endpoint
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

// Handle Undefined Routes
app.use((req, res) => {
  console.warn(`Unhandled route: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
