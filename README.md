LHL Node Skeleton
=========

# Schoodle

Schoodle is a simplified, modernized version of Doodle for scheduling group events. It allows organizers to create events with proposed time slots and share a unique URL with attendees. Attendees can specify their availability and view responses, making group scheduling easier.

---

## Project Overview

Schoodle helps groups schedule events efficiently by:
1. Allowing organizers to propose time slots and share a unique event link.
2. Letting attendees submit their availability for each proposed time slot.
3. Providing dynamic updates with Single-Page Application (SPA) behavior.

---

## Requirements

1. Visitors can create an event proposal by specifying:
   - Event title and description.
   - Their name and email.
2. Organizers can share a unique URL for attendees to respond.
3. Attendees can:
   - Specify their name and email.
   - Submit their availability (yes/no) for each proposed time slot.
   - View all responses, including their own.
   - Modify their response.
4. URLs should be secret (e.g., a long, unique string instead of simple auto-incrementing IDs).

---

## Features

1. Event creation with a unique URL.
2. Attendee responses, view, and modification capabilities.
3. SPA behavior with dynamic updates using AJAX.
4. Input validation to prevent SQL injection and XSS attacks.

---

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL.
- **Frontend:** HTML, CSS/SCSS, JavaScript, jQuery.
- **Version Control:** Git.
- **Security:** Unique event URLs, input validation.
- **Optional:** Hosting via Railway.app, Netlify, or similar.

---

## Getting Started

### Project Setup
1. Clone the repo:
   ```bash
   git clone <repository-url>
   ```
2. Create the `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your local PostgreSQL credentials:
   - `DB_USER=labber`
   - `DB_PASS=labber`
   - `DB_NAME=midterm`
4. Install dependencies:
   ```bash
   npm install
   ```
5. Fix binaries for Sass:
   ```bash
   npm rebuild node-sass
   ```
6. Reset the database:
   ```bash
   npm run db:reset
   ```
7. Start the server:
   ```bash
   npm run local
   ```
8. Visit the application in your browser at `http://localhost:8080/`.

---

## API Endpoints

### POST /events
- **Description:** Create a new event.
- **Request Body:**
  ```json
  {
    "title": "Team Meeting",
    "description": "Discuss project progress",
    "organizer_name": "Abbas",
    "organizer_email": "abbas@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Team Meeting",
    "description": "Discuss project progress",
    "organizer_name": "Abbas",
    "organizer_email": "abbas@example.com",
    "created_at": "2025-01-11T12:00:00Z"
  }
  ```

### GET /events/:id
- **Description:** Fetch details of an event by its ID.
- **Request Parameters:**
  - `:id` - The unique ID of the event.
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Team Meeting",
    "description": "Discuss project progress",
    "organizer_name": "Abbas",
    "organizer_email": "abbas@example.com",
    "created_at": "2025-01-11T12:00:00Z"
  }
  ```

---

## User Stories

### Organizer Stories
1. Create events to share with attendees.
2. View all attendee responses.
3. Modify/update event details.

### Attendee Stories
1. View event details via a unique URL.
2. Submit their availability for proposed time slots.
3. Modify or update their responses.
4. View all responses for the event.

---

## Database Schema

### Tables
1. **Events Table:** Stores event details (title, description, organizer info).
2. **Attendees Table:** Stores attendee information (name, email).
3. **Time Slots Table:** Stores proposed time slots for each event.
4. **Availability Responses Table:** Tracks attendee responses for each time slot.

### Relationships (ERD)
- **Event → Attendees:** One-to-Many.
- **Event → Time Slots:** One-to-Many.
- **Time Slot → Availability Responses:** One-to-Many.
- **Attendee → Time Slots:** Many-to-Many.

---

## Team Members

- Abbas
- Abdullah
- Kyle
- Peter

---

## Dependencies

- Node.js 10.x or above
- npm 5.x or above
- PostgreSQL 6.x
- Express 4.x
- pg (PostgreSQL Client) 8.x
- jQuery 3.x
- Node-Sass 4.x

---

## How to Contribute

1. Clone the repo locally.
2. Create a new branch:
   ```bash
   git checkout -b <your-branch-name>
   ```
3. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Your message here"
   ```
4. Push your branch to the remote repository:
   ```bash
   git push origin <your-branch-name>
   ```
5. Submit a pull request on GitHub.

---

## Acknowledgments

- Inspired by Doodle for event scheduling.
- Special thanks to Lighthouse Labs for providing the project framework.
