document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');
  const eventList = document.getElementById('event-list');

  // Ensure success message is hidden initially
  if (successMessage) successMessage.style.display = 'none';

  // Form validation
  const validateForm = () => {
    const eventName = document.getElementById('event_name').value.trim();
    const eventDescription = document.getElementById('description').value.trim();
    const timeSlots = document.getElementById('time_slots').value.trim();

    // Ensure all fields are filled
    if (!eventName || !eventDescription || !timeSlots) {
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
    const eventName = document.getElementById('event_name').value.trim();
    const eventDescription = document.getElementById('description').value.trim();
    const organizerName = document.getElementById('organizer_name').value.trim();
    const organizerEmail = document.getElementById('organizer_email').value.trim();
    const timeSlots = document.getElementById('time_slots').value.trim();

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          description: eventDescription,
          organizer_name: organizerName,
          organizer_email: organizerEmail,
          time_slots: timeSlots.split(',').map((slot) => ({
            start_time: slot.trim(),
            end_time: slot.trim(), // Assuming start and end time are the same for simplicity
          })),
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        renderEvent(newEvent);

        if (successMessage) {
          successMessage.style.display = 'block';
          successMessage.textContent = 'Event created successfully!';
        }
        form.reset();

        // Hide success message after 3 seconds
        setTimeout(() => {
          if (successMessage) successMessage.style.display = 'none';
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error('Error creating event:', errorText);
        alert('Failed to create the event. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });

  // Render event dynamically
  const renderEvent = (event) => {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.innerHTML = `
      <h3>${event.event_name}</h3>
      <p>${event.description}</p>
      <p><strong>Organizer:</strong> ${event.organizer_name} (${event.organizer_email})</p>
      <p><strong>Time Slots:</strong> ${event.time_slots.map(slot => slot.start_time).join(', ')}</p>
    `;
    eventList.appendChild(eventItem);
  };

  // Fetch all events and display them on the page
  const fetchAndDisplayEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const events = await response.json();
        if (events.length === 0) {
          eventList.innerHTML = '<p>No events available. Create one above!</p>';
        } else {
          eventList.innerHTML = ''; // Clear existing events
          events.forEach((event) => renderEvent(event));
        }
      } else {
        console.error('Failed to fetch events:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch events on page load
  fetchAndDisplayEvents();
});
