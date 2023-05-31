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
    for (const [ticket, value] of Object.entries(data)) {
      if (value.totalActiveTime >= 15 * 60 * 1000) {
        const p = document.createElement("p");
        p.textContent = `${ticket}: ${formatTime(value.totalActiveTime)}`;
        ticketList.appendChild(p);
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
