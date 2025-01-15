// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');

  // form validation
  const validateForm = () => {
    const eventName = document.getElementById('event-name').value;
    const eventDescription = document.getElementById('event-description').value;
    const organizerName = document.getElementById('organizer-name').value;
    const organizerEmail = document.getElementById('organizer-email').value;
    const timeSlots = document.querySelectorAll("input[name='event-time-slot']:checked");

  // field validation
  if (!eventName.trim() || !eventDescription.trim() || !timeSlots.trim()) {
      alert('All fields are required.');
      return false;
    }
    return true;
  };

   // Get time slots dynamically
   const loadTimeSlots = async () => {
    const timeSlotContainer = document.getElementById('time-slot-container');
    try {
      const response = await fetch('/time_slots');
      if (!response.ok) throw new Error('Failed to fetch time slots.');

      const timeSlots = await response.json();
      timeSlots.forEach(slot => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'event-time-slot';
        input.value = `${slot.start_time}-${slot.end_time}`;
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${slot.start_time} - ${slot.end_time}`));
        timeSlotContainer.appendChild(label);
      });
    } catch (error) {
      console.error('Error loading time slots:', error);
      alert('Could not load time slots. Please try again later.');
    }
  };

  // form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

  // validate form
    if (!validateForm()) {
      return;
    }

    // Collect form data collection
    const eventName = document.getElementById('event-name').value;
    const eventDescription = document.getElementById('event-description').value;
    const organizerName = document.getElementById('organizer-name').value;
    const organizerEmail = document.getElementById('organizer-email').value;
    const timeSlots = Array.from(document.querySelectorAll("input[name='event-time-slot']:checked"))
                           .map(checkbox => checkbox.value);

    // Send data to backend
    try {
      const response = await fetch('/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          description: eventDescription,
          organizer_name: organizerName,
          organizer_email: organizerEmail,
          timeSlots,
        }),
      });

      if (response.ok) {
        // success and reset
        successMessage.style.display = 'block';
        successMessage.textContent = 'Event created successfully!';
        form.reset();

        // Hide success message after 3 seconds
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 3000);
      } else {
        // Handle backend errors
        const errorText = await response.text();
        console.error('Error creating event:', errorText);
        alert('Failed to create the event. Please try again.');
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });

  // Load the time slots on page load
  loadTimeSlots();

  // Event modification handler
  document.getElementById('modify-event-button').addEventListener('click', async () => {
    const eventId = 'specificEventId'; // Retrieve the event ID dynamically
    const newName = prompt("Enter new event name:");
    const newDescription = prompt("Enter new event description:");

    try {
      const response = await fetch(`/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: newName,
          description: newDescription,
        }),
      });

      if (response.ok) {
        alert("Event updated successfully!");
        // Reload or refresh event details here
      } else {
        alert("Error updating event.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event.");
    }
  });

  // Event deletion handler
  document.getElementById('delete-event-button').addEventListener('click', async () => {
    const eventId = 'specificEventId'; // Retrieve event ID dynamically
    const confirmation = confirm("Are you sure you want to delete this event?");

    if (!confirmation) return;

    try {
      const response = await fetch(`/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Event deleted successfully!");
        // Redirect or update UI after deletion
      } else {
        alert("Error deleting event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event.");
    }
  });

  // Time Slot modification handler
  async function modifyTimeSlot(timeSlotId) {
    const newStartTime = prompt("Enter new start time:");
    const newEndTime = prompt("Enter new end time:");

    if (!newStartTime || !newEndTime) {
      alert("Both start and end times are required.");
      return;
    }

    try {
      const response = await fetch(`/time_slots/${timeSlotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_time: newStartTime, end_time: newEndTime }),
      });

      if (response.ok) {
        alert("Time slot updated successfully!");
        // Refresh time slots if needed
      } else {
        alert("Error updating time slot.");
      }
    } catch (error) {
      console.error("Error updating time slot:", error);
      alert("Error updating time slot.");
    }
  }

  // Time Slot deletion handler
  async function deleteTimeSlot(timeSlotId) {
    const confirmation = confirm("Are you sure you want to delete this time slot?");
    if (!confirmation) return;

    try {
      const response = await fetch(`/time_slots/${timeSlotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Time slot deleted successfully!");
        // Refresh time slots if needed
      } else {
        alert("Error deleting time slot.");
      }
    } catch (error) {
      console.error("Error deleting time slot:", error);
      alert("Error deleting time slot.");
    }
  }

  // Load event details and time slots
  async function loadEventDetails(eventId) {
    const response = await fetch(`/events/${eventId}`);
    const event = await response.json();

    // Display event details
    document.getElementById('event-name-display').textContent = event.event_name;
    document.getElementById('event-description-display').textContent = event.description;

    // Display time slots
    const timeSlotsResponse = await fetch(`/time_slots/event/${eventId}`);
    const timeSlots = await timeSlotsResponse.json();

    const timeSlotList = document.getElementById('time-slots-list');
    timeSlotList.innerHTML = ''; // Clear existing slots

    timeSlots.forEach((slot) => {
      const li = document.createElement('li');
      li.textContent = `${slot.start_time} - ${slot.end_time}`;

      // Modify and Delete Buttons for Time Slot
      const modifyButton = document.createElement('button');
      modifyButton.textContent = 'Modify';
      modifyButton.addEventListener('click', () => modifyTimeSlot(slot.time_slot_id));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteTimeSlot(slot.time_slot_id));

      li.appendChild(modifyButton);
      li.appendChild(deleteButton);
      timeSlotList.appendChild(li);
    });
  }
});

