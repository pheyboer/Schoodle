CREATE TABLE public.availability_responses (
    response_id SERIAL PRIMARY KEY,
    attendee_id INTEGER NOT NULL,
    time_slot_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    availability BOOLEAN,
    FOREIGN KEY (attendee_id) REFERENCES public.attendees(attendee_id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(time_slot_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE
);
