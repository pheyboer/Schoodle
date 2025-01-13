DROP TABLE IF EXISTS availability_responses CASCADE;

CREATE TABLE availability_responses (
    response_id SERIAL PRIMARY KEY,
    attendee_id INTEGER NOT NULL,
    time_slot_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    FOREIGN KEY (attendee_id) REFERENCES attendees(attendee_id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(time_slot_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);
