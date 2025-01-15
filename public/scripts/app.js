// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
const successMessage = document.getElementById('success-message');

  // form submission 
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // form data collection
 const eventName = document.getElementById('event-name').value;
  const eventDescription = document.getElementById('event-description').value;
    const timeSlots = document.getElementById('event-time-slots').value;

    // send data to backend
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
        form.reset(); 
      } else {
        console.error('Error creating event:', await response.text());
        alert('Failed to create the event. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
});
