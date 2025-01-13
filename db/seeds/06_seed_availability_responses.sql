-- Seed data for the availability_responses table - tesing
INSERT INTO availability_responses (attendee_id, time_slot_id, event_id, availability)
VALUES
    (1, 1, 1, true),
    (2, 1, 1, false),
    (3, 1, 1, true),
    (1, 2, 1, true),
    (2, 2, 1, true),
    (3, 2, 1, false),
    (1, 3, 1, false),
    (2, 3, 1, true),
    (3, 3, 1, true);
