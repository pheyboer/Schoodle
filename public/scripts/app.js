// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');
  const attendeeForm = document.getElementById('availability-form');
  const attendeesList = document.getElementById('attendees-list');

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
      }
    });
  });

  // show first page on load
  document.querySelectorAll('main > section').forEach((section, index) => {
    section.style.display = index === 0 ? 'block' : 'none';
  });

  // Form validation
  const validateForm = () => {
    const eventName = document.getElementById('event-name').value;
    const eventDescription = document.getElementById('event-description').value;
    const timeSlots = document.getElementById('event-time-slots').value;

    // Field validation form
    if (!eventName.trim() || !eventDescription.trim() || !timeSlots.trim()) {
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
    const eventName = document.getElementById('event-name').value;
    const eventDescription = document.getElementById('event-description').value;
    const timeSlots = document.getElementById('event-time-slots').value;

    // Send data to backend
    try {
      const response = await fetch('/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          description: eventDescription,
          timeSlots,
        }),
      });

      if (response.ok) {
        
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

  // Fetch Event Details 
  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();

        
        document.getElementById('event-name-display').textContent = eventData.name;
        document.getElementById('event-description-display').textContent = eventData.description;

      
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

  // Fetch event details for a specific event 
  fetchEventDetails('example-event-id');

  // Attendee Form Submission
  attendeeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const attendeeName = document.getElementById('attendee-name').value;
    const timeSlots = Array.from(
      document.querySelectorAll('input[name="time-slot"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!attendeeName.trim() || timeSlots.length === 0) {
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
        console.error('Error submitting availability:', await response.text());
        alert('Failed to submit availability. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
});