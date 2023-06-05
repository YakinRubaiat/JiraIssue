function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}hr ${minutes % 60}min`;
}

function updateUI() {
  chrome.storage.local.get(null, (data) => {
    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = "";

    // Sort tickets by total active time in descending order
    const sortedData = Object.entries(data).sort(
      ([, a], [, b]) => b.totalActiveTime - a.totalActiveTime
    );

    for (const [ticket, value] of sortedData) {
      if (value.totalActiveTime >= 5 * 60 * 1000) {
        const div = document.createElement("div"); // Create a new div for each ticket
        const a = document.createElement("a");
        a.textContent = `${ticket}: ${formatTime(value.totalActiveTime)}`;
        a.href = value.url;
        a.target = "_blank";
        div.appendChild(a); // Append the link to the div
        ticketList.appendChild(div); // Append the div to the ticket list
      }
    }
  });
}

// Clear data when the button is clicked
document.getElementById("clearButton").addEventListener("click", () => {
  chrome.storage.local.clear();
  updateUI();
});

updateUI();
