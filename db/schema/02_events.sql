DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,
    organizer_email VARCHAR(255) NOT NULL,
    unique_url TEXT UNIQUE
);
