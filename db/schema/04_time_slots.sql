DROP TABLE IF EXISTS time_slots CASCADE;

CREATE TABLE time_slots (
    time_slot_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);
