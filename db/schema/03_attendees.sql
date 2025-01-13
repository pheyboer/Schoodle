CREATE TABLE public.attendees (
    attendee_id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    availability TEXT,
    CONSTRAINT attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE
);
