// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');
  const attendeeForm = document.getElementById('availability-form');
  const attendeesList = document.getElementById('attendees-list');

  successMessage.style.display = 'none';

   // nav in sections
   document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Hide sections
      document.querySelectorAll('main > section').forEach((section) => {
        section.style.display = 'none';
      });

      // Show target section
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.style.display = 'block';
      } else {
        console.error(`Section ${link.getAttribute('href')} not found`);
      }
    });
  });

  // show first page on load
  document.querySelectorAll('main > section').forEach((section, index) => {
    section.style.display = index === 0 ? 'block' : 'none';
  });

  // Form validation
  const validateForm = () => {
    const eventName = document.getElementById('event-name').value.trim();
    const eventDescription = document.getElementById('event-description').value.trim();
    const organizerName = document.getElementById('organizer_name').value.trim();
    const organizerEmail = document.getElementById('organizer_email').value.trim();
    const timeSlotEntries = document.querySelectorAll('.time-slot-entry');

    // Ensure all time slots have start and end times
    const timeSlots = Array.from(timeSlotEntries).map(slot => ({
      start_time: slot.querySelector('input[name="start_time[]"]').value,
      end_time: slot.querySelector('input[name="end_time[]"]').value
    }));

    // Field validation form
    if (!eventName || !eventDescription || !organizerName || !organizerEmail || timeSlots.some(slot => !slot.start_time || !slot.end_time)) {
      alert('All fields are required.');
      return false;
    }
    return true;
  };

  // Form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Collect form data
    const eventName = document.getElementById('event-name').value.trim();
    const eventDescription = document.getElementById('event-description').value.trim();
    const organizerName = document.getElementById('organizer_name').value.trim();
    const organizerEmail = document.getElementById('organizer_email').value.trim();
    const timeSlots = Array.from(document.querySelectorAll('.time-slot-entry')).map(slot => ({
      start_time: slot.querySelector('input[name="start_time[]"]').value,
      end_time: slot.querySelector('input[name="end_time[]"]').value
    }));

    // Send data to backend
    try {
      const response = await fetch('/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          description: eventDescription,
          organizer_name: organizerName,
          organizer_email: organizerEmail,
          time_slots: timeSlots,
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        renderEvent(newEvent);

        successMessage.style.display = 'block';
        successMessage.textContent = 'Event created successfully!';
        form.reset();

        // Display the unique URL
        const uniqueUrlSection = document.getElementById('unique-url-section');
        const eventUrl = document.getElementById('event-url');
        eventUrl.innerHTML = `<a href="${newEvent.uniqueUrl}" target="_blank">${newEvent.uniqueUrl}</a>`;
        uniqueUrlSection.style.display = 'block';

        // Hide success message after 10 seconds
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 10000);
      } else {
        // Handle backend errors
        const errorText = await response.text();
        console.error('Error creating event:', errorText); // Log the error response
        alert(`Failed to create the event. Please try again. Error: ${errorText}`);
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error('Error:', error); // Log the error
      alert('An error occurred. Please try again.');
    }
  });

   // render event dynamically
   const renderEvent = (event) => {
    const eventList = document.getElementById('event-list');
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.innerHTML = `
      <h3>${event.name}</h3>
      <p>${event.description}</p>
      <p><strong>Time Slots:</strong> ${event.timeSlots}</p>
    `;
    eventList.appendChild(eventItem);
  };

// fetch all events and display on same page
const fetchAndDisplayEvents = async () => {
  try {
    const response = await fetch('/events');
    if (response.ok) {
      const events = await response.json();
      if (events.length === 0) {
        document.getElementById('event-list').innerHTML = '<p>No events available. Create one above!</p>'; // FIXED
      } else {
        events.forEach((event) => renderEvent(event));
      }
    } else {
      console.error('Failed to fetch events:', await response.text());
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// fetchAndDisplayEvents on page load
fetchAndDisplayEvents();


  // Fetch Event Details
  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();

        // display event details
        document.getElementById('event-name-display').textContent = eventData.name;
        document.getElementById('event-description-display').textContent = eventData.description;

      // display attendee details
        attendeesList.innerHTML = '';
        for (const attendee of eventData.attendees) {
          const listItem = document.createElement('li');
          listItem.textContent = attendee.name;
          attendeesList.appendChild(listItem);
        }
      } else {
        console.error('Failed to fetch event details:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  // Attendee Form Submission
  attendeeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const attendeeName = document.getElementById('attendee-name').value.trim();
    const timeSlots = Array.from(
      document.querySelectorAll('input[name="time-slot"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!attendeeName || timeSlots.length === 0) {
      alert('Please provide your name and select at least one time slot.');
      return;
    }

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: attendeeName, timeSlots }),
      });

      if (response.ok) {
        alert('Availability submitted successfully!');
        attendeeForm.reset();
      } else {
        const errorText = await response.text();
        console.error('Error submitting availability:', errorText);
        alert('Failed to submit availability. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
});
