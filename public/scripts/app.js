// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const successMessage = document.getElementById('success-message');
  const attendeeForm = document.getElementById('availability-form');
  const attendeesList = document.getElementById('attendees-list');

  // form validation 
  const validateForm = () => {
    const eventName = document.getElementById('event-name').value;
    const eventDescription = document.getElementById('event-description').value;
    const timeSlots = document.getElementById('event-time-slots').value;

  // field validation
  if (!eventName.trim() || !eventDescription.trim() || !timeSlots.trim()) {
      alert('All fields are required.');
      return false;
    }
    return true;
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
});

