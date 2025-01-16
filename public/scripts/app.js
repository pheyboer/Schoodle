// Client-facing scripts here
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("event-form");
  const successMessage = document.getElementById("success-message");
  const eventList = document.getElementById("event-list");

  // Ensure success message is hidden initially
  if (successMessage) successMessage.style.display = "none";

  // Validate and transform time slots
  const formatTimeSlots = (timeSlotsInput) => {
    const currentDate = new Date().toISOString().split("T")[0]; // Get today's date
    return timeSlotsInput.split(",").map((slot) => {
      const time = slot.trim();
      // Convert "10am" to "YYYY-MM-DD 10:00:00"
      const formattedTime = `${currentDate} ${time.replace(
        /(\d+)(am|pm)/i,
        (_, hour, period) => {
          let h = parseInt(hour, 10);
          if (period.toLowerCase() === "pm" && h !== 12) h += 12;
          if (period.toLowerCase() === "am" && h === 12) h = 0;
          return `${h.toString().padStart(2, "0")}:00:00`;
        }
      )}`;
      return formattedTime;
    });
  };

  // Form submission handler
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Form submitted!");

    const eventName = document.getElementById("event_name").value.trim();
    const eventDescription = document.getElementById("description").value.trim();
    const timeSlotsInput = document.getElementById("time_slots").value.trim();

    if (!eventName || !eventDescription || !timeSlotsInput) {
      alert("All fields are required.");
      return;
    }

    const timeSlots = formatTimeSlots(timeSlotsInput); // Format time slots

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          description: eventDescription,
          time_slots: timeSlots.map((slot) => ({
            start_time: slot,
            end_time: slot, // Adjust end_time logic as needed
          })),
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        renderEvent(newEvent); // Render new event
        if (successMessage) {
          successMessage.style.display = "block";
          successMessage.textContent = "Event created successfully!";
        }
        form.reset();
        setTimeout(() => {
          if (successMessage) successMessage.style.display = "none";
        }, 3000);
      } else {
        console.error("Error creating event:", await response.text());
        alert("Failed to create the event. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

  // Render event dynamically
  const renderEvent = (event) => {
    const eventItem = document.createElement("div");
    eventItem.classList.add("event-item");
    eventItem.innerHTML = `
      <h3>${event.event_name}</h3>
      <p>${event.description}</p>
      <p><strong>Time Slots:</strong> ${event.time_slots.map(
        (slot) => slot.start_time
      ).join(", ")}</p>
    `;
    eventList.appendChild(eventItem);
  };
});
