
# Schoodle - A Scheduling Application

Schoodle is a simple scheduling application built using Node.js, Express, and PostgreSQL for the backend. The frontend utilizes HTML, CSS/SCSS, and jQuery to provide an intuitive user interface.

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: HTML, CSS/SCSS, JavaScript, jQuery
- **Version Control**: Git
- **Security**: Unique event URLs, input validation

## Getting Started

### Prerequisites

1. **Node.js** (v14.x or higher)
2. **PostgreSQL** (v14.x or higher)
3. **npm** (comes with Node.js)

### Setting Up the Project

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:

   ```bash
   cd Schoodle
   ```

3. **Create the `.env` file**:

   ```bash
   cp .env.example .env
   ```

4. **Update the `.env` file with your local PostgreSQL credentials**:

   ```plaintext
   DB_HOST=localhost
   DB_USER=labber
   DB_PASS=labber
   DB_NAME=midterm
   DB_PORT=5432
   ```

   Replace `labber` and `midterm` with your own PostgreSQL user and database if necessary.

5. **Install dependencies**:

   ```bash
   npm install
   ```

6. **Rebuild `node-sass` binaries** (if necessary):

   ```bash
   npm rebuild node-sass
   ```

7. **Reset the database**:

   ```bash
   npm run db:reset
   ```

8. **Start the server**:

   ```bash
   npm run local
   ```

9. **Visit the application** at [http://localhost:8080/](http://localhost:8080/).

---

## Dependencies

### **Core Dependencies**

- **express**: Web framework for Node.js
- **pg**: PostgreSQL client for Node.js
- **dotenv**: For loading environment variables from `.env` file
- **morgan**: HTTP request logger middleware for Node.js
- **chalk**: Terminal string styling
- **moment**: For date and time manipulation
- **ejs**: Templating engine for HTML rendering
- **sass**: For compiling SCSS to CSS

### **Dev Dependencies**

- **nodemon**: Automatically restarts the server during development

---

## Running the Application Locally

To run the application locally, follow these steps:

1. Clone the repository to your local machine.
2. Set up the environment by creating the `.env` file and configuring it with your PostgreSQL credentials.
3. Run `npm install` to install the necessary dependencies.
4. Start the server by running `npm run local`.
5. Open your browser and go to [http://localhost:8080](http://localhost:8080).

---

## Notes

- **Database Setup**: If you don't have the `midterm` database already created, you can do so by running:
  
  ```sql
  CREATE DATABASE midterm;
  ```

- **PostgreSQL User**: Ensure that the PostgreSQL user `labber` has the necessary privileges to access and modify the `midterm` database.

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

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
