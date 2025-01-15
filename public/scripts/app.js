// Client facing scripts here
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
const successMessage = document.getElementById('success-message');

  // form submission 
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // form data collection
    const validateForm = () => {
 const eventName = document.getElementById('event-name').value;
  const eventDescription = document.getElementById('event-description').value;
    const timeSlots = document.getElementById('event-time-slots').value;

    if (!eventName.trim() || !eventDescription.trim() || !timeSlots.trim()) {
      alert('All fields are required.');
      return false;
    }
    return true;
  };

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

      // error message for forms
      const validateForm = () => {
        if (!eventName.trim() || !eventDescription.trim() || !timeSlots.trim()) {
          alert('All fields are required.');
          return false;
        }
        return true;
      };
      
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
      
        
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
