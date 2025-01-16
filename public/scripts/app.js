// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');

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

        // Store complete event data including organizer info
        sessionStorage.setItem('latestEvent', JSON.stringify({
          event_id: newEvent.event_id,
          event_name: newEvent.event_name,
          description: newEvent.description,
          organizer_name: newEvent.organizer_name,
          organizer_email: newEvent.organizer_email,
          uniqueUrl: newEvent.uniqueUrl,
          time_slots: newEvent.time_slots
        }));

        // Stay on current page and show success message
        successMessage.style.display = 'block';
        successMessage.textContent = 'Event created successfully!';
        form.reset();

        // Display the unique URL without switching tabs
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
      <h3>${event.event_name}</h3>
      <p>${event.description}</p>
      <p><strong>Organizer:</strong> ${event.organizer_name}</p>
      <p><strong>Contact:</strong> ${event.organizer_email}</p>
      <p><strong>Time Slots:</strong> ${event.time_slots ? event.time_slots.length : 0} available</p>
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

  // Add event listener for the Event Details nav link
  document.querySelector('a[href="#event-details"]').addEventListener('click', function(e) {
    e.preventDefault();

    // Get the latest event from sessionStorage
    const latestEvent = JSON.parse(sessionStorage.getItem('latestEvent'));
    console.log('Latest event data:', latestEvent); // Debug log

    if (latestEvent) {
      // Clear previous content
      document.getElementById('time-slots-display').innerHTML = '<h4>Available Time Slots</h4>';

      // Update Event Details section with all event information
      document.getElementById('event-name-display').textContent = latestEvent.event_name;
      document.getElementById('event-description-display').textContent = latestEvent.description;
      document.getElementById('organizer-name-display').textContent = latestEvent.organizer_name;
      document.getElementById('organizer-email-display').textContent = latestEvent.organizer_email;

      // Display time slots if they exist
      if (latestEvent.time_slots && latestEvent.time_slots.length > 0) {
        const timeSlotsList = document.createElement('ul');
        latestEvent.time_slots.forEach(slot => {
          const li = document.createElement('li');
          const timeText = document.createElement('span');
          const start = new Date(slot.start_time).toLocaleString();
          const end = new Date(slot.end_time).toLocaleString();
          timeText.textContent = `${start} - ${end}`;

          const actionButtons = document.createElement('div');
          actionButtons.className = 'time-slot-actions';
          actionButtons.innerHTML = `
            <button onclick="editTimeSlot(${slot.time_slot_id})" class="edit-button">Edit</button>
            <button onclick="deleteTimeSlot(${slot.time_slot_id})" class="delete-button">Delete</button>
          `;

          li.appendChild(timeText);
          li.appendChild(actionButtons);
          timeSlotsList.appendChild(li);
        });
        document.getElementById('time-slots-display').appendChild(timeSlotsList);
      }

      // Display share URL
      document.getElementById('unique-url-display').innerHTML =
        `<h4>Share Event</h4><p>Share this URL with your attendees: <a href="${latestEvent.uniqueUrl}" target="_blank">${latestEvent.uniqueUrl}</a></p>`;
    } else {
      console.log('No event data found in sessionStorage');
    }

    // Show the event details section
    document.querySelectorAll('main > section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById('event-details').style.display = 'block';
  });

});

// Add these functions after the existing code
function editEvent() {
  const latestEvent = JSON.parse(sessionStorage.getItem('latestEvent'));
  if (!latestEvent) return;

  // Populate form with current values
  document.getElementById('event-name').value = latestEvent.event_name;
  document.getElementById('event-description').value = latestEvent.description;
  document.getElementById('organizer_name').value = latestEvent.organizer_name;
  document.getElementById('organizer_email').value = latestEvent.organizer_email;

  // Switch to create event section
  document.querySelectorAll('main > section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('create-event').style.display = 'block';

  // Change form submission behavior for update
  const form = document.getElementById('event-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await updateEvent(latestEvent.event_id);
  };
}

async function updateEvent(eventId) {
  try {
    const response = await fetch(`/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: document.getElementById('event-name').value,
        description: document.getElementById('event-description').value,
        organizer_name: document.getElementById('organizer_name').value,
        organizer_email: document.getElementById('organizer_email').value,
        time_slots: Array.from(document.querySelectorAll('.time-slot-entry')).map(slot => ({
          start_time: slot.querySelector('input[name="start_time[]"]').value,
          end_time: slot.querySelector('input[name="end_time[]"]').value
        }))
      })
    });

    if (response.ok) {
      alert('Event updated successfully!');
      location.reload();
    } else {
      alert('Failed to update event');
    }
  } catch (error) {
    console.error('Error updating event:', error);
    alert('Error updating event');
  }
}

async function deleteEvent() {
  const latestEvent = JSON.parse(sessionStorage.getItem('latestEvent'));
  if (!latestEvent || !latestEvent.event_id) {
    alert('No event selected to delete');
    return;
  }

  if (confirm('Are you sure you want to delete this event? This will also delete all related time slots and responses.')) {
    try {
      const response = await fetch(`/events/${latestEvent.event_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Event deleted successfully!');
        sessionStorage.removeItem('latestEvent');
        // Redirect to create event page
        document.querySelectorAll('main > section').forEach(section => {
          section.style.display = 'none';
        });
        document.getElementById('create-event').style.display = 'block';
        // Refresh the events list
        fetchAndDisplayEvents();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete event: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  }
}

// Add these functions for time slot management
async function editTimeSlot(timeSlotId) {
  const latestEvent = JSON.parse(sessionStorage.getItem('latestEvent'));
  const timeSlot = latestEvent.time_slots.find(slot => slot.time_slot_id === timeSlotId);

  if (!timeSlot) return;

  // Create a form for editing the time slot
  const newStartTime = prompt('Enter new start time (YYYY-MM-DD HH:MM):', new Date(timeSlot.start_time).toLocaleString());
  const newEndTime = prompt('Enter new end time (YYYY-MM-DD HH:MM):', new Date(timeSlot.end_time).toLocaleString());

  if (!newStartTime || !newEndTime) return;

  try {
    const response = await fetch(`/time_slots/${timeSlotId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_time: new Date(newStartTime).toISOString(),
        end_time: new Date(newEndTime).toISOString()
      })
    });

    if (response.ok) {
      // Update the time slot in session storage
      const updatedTimeSlots = latestEvent.time_slots.map(slot =>
        slot.time_slot_id === timeSlotId
          ? { ...slot, start_time: newStartTime, end_time: newEndTime }
          : slot
      );
      latestEvent.time_slots = updatedTimeSlots;
      sessionStorage.setItem('latestEvent', JSON.stringify(latestEvent));

      // Refresh the display
      document.querySelector('a[href="#event-details"]').click();
    } else {
      alert('Failed to update time slot');
    }
  } catch (error) {
    console.error('Error updating time slot:', error);
    alert('Error updating time slot');
  }
}

async function deleteTimeSlot(timeSlotId) {
  if (!confirm('Are you sure you want to delete this time slot?')) return;

  const latestEvent = JSON.parse(sessionStorage.getItem('latestEvent'));

  try {
    const response = await fetch(`/time_slots/${timeSlotId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Remove the time slot from session storage
      const updatedTimeSlots = latestEvent.time_slots.filter(slot => slot.time_slot_id !== timeSlotId);
      latestEvent.time_slots = updatedTimeSlots;
      sessionStorage.setItem('latestEvent', JSON.stringify(latestEvent));

      // Refresh the display
      document.querySelector('a[href="#event-details"]').click();
    } else {
      alert('Failed to delete time slot');
    }
  } catch (error) {
    console.error('Error deleting time slot:', error);
    alert('Error deleting time slot');
  }
}
