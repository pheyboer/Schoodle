CREATE TABLE public.attendees (
    attendee_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    availability TEXT,
    FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE
);
