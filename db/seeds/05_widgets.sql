-- Clear the table to avoid duplicates
TRUNCATE TABLE widgets RESTART IDENTITY CASCADE;

-- Insert relevant widgets for Schoodle
INSERT INTO widgets (name, user_id) VALUES ('Event Calendar', 1);
INSERT INTO widgets (name, user_id) VALUES ('Availability Poll', 2);
INSERT INTO widgets (name, user_id) VALUES ('Response Summary', 3);
INSERT INTO widgets (name, user_id) VALUES ('Notification Tool', 4);