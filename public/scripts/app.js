// Client-facing scripts here

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');
  const attendeeForm = document.getElementById('availability-form');
  const attendeesList = document.getElementById('attendees-list');
  const eventList = document.getElementById('event-list');

  // Ensure success message is hidden initially
  if (successMessage) successMessage.style.display = 'none';

  // Navigation between sections
  document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Hide all sections
      document.querySelectorAll('main > section').forEach((section) => {
        section.style.display = 'none';
      });

      // Show the target section
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.style.display = 'block';
      } else {
        console.error(`Section ${link.getAttribute('href')} not found`);
      }
    });
  });

  // Show only the first section on page load
  document.querySelectorAll('main > section').forEach((section, index) => {
    section.style.display = index === 0 ? 'block' : 'none';
  });

  // Form validation
  const validateForm = () => {
    const eventName = document.getElementById('event_name').value.trim();
    const eventDescription = document.getElementById('description').value.trim();
    const timeSlots = document.getElementById('time_slot').value.trim();

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
    console.log('Form submitted!');

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Collect form data
    const eventName = document.getElementById('event_name').value.trim();
    const eventDescription = document.getElementById('description').value.trim();
    const timeSlots = document.getElementById('time_slot').value.trim();

    try {
      // Ensure API endpoint matches the server route
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          description: eventDescription,
          time_slots: timeSlots.split(',').map((slot) => ({ start_time: slot.trim(), end_time: slot.trim() })),
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        renderEvent(newEvent); // Render new event

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
