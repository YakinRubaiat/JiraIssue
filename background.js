// Object to store the tab durations and active times
const tabData = {};

// Function to calculate and update the tab duration and active time
function updateTabData(tabId) {
  const currentTimestamp = new Date().getTime();
  const tabDataObj = tabData[tabId];
  const tabDuration = currentTimestamp - tabDataObj.startTime;
  const activeDuration = currentTimestamp - tabDataObj.lastActiveTime;

  tabDataObj.duration = tabDuration;
  tabDataObj.activeTime += activeDuration;

  if (tabDataObj.duration >= 1 * 30 * 1000) {
    const ticketNumber = extractTicketNumber(tabDataObj.url); // Implement your logic to extract the ticket number from the URL
    if (ticketNumber) {
      tabDataObj.ticketNumber = ticketNumber;
    }
  }

  tabDataObj.lastActiveTime = currentTimestamp;
}

// Function to update the extension badge with tab duration
function updateBadge(tabId) {
  const durationMinutes = Math.floor(tabData[tabId].duration / (1000 * 60));
  chrome.browserAction.setBadgeText({
    text: durationMinutes.toString(),
    tabId: tabId,
  });
}

// Function to extract the ticket number from the URL
function extractTicketNumber(url) {
  const urlParts = url.split("/");
  const ticketNumber = urlParts[urlParts.length - 1];
  return ticketNumber;
}

// Function to update tab data for all open tabs
function updateAllTabData() {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url.includes("atlassian") && tabData[tab.id]) {
        updateTabData(tab.id);
        updateBadge(tab.id);
      } else if (tab.url.includes("atlassian")) {
        createNewData(tab);
      }
    });
  });
}

function createNewData(tab) {
  const ticketNumber = extractTicketNumber(tab.url); // Implement your logic to extract the ticket number from the URL
  if (ticketNumber) {
    tabData[tab.id] = {
      startTime: new Date().getTime(),
      lastActiveTime: new Date().getTime(),
      duration: 0,
      activeTime: 0,
      url: tab.url,
      ticketNumber: null,
    };
    updateBadge(tab.id);
  }
}

// Listener for tab creation
chrome.tabs.onCreated.addListener(function (tab) {
  if (tab.url.includes("atlassian")) {
    const ticketNumber = extractTicketNumber(tab.url); // Implement your logic to extract the ticket number from the URL
    if (ticketNumber) {
      tabData[tab.id] = {
        startTime: new Date().getTime(),
        lastActiveTime: new Date().getTime(),
        duration: 0,
        activeTime: 0,
        url: tab.url,
        ticketNumber: null,
      };
      updateBadge(tab.id);
    }
  }
});

// Listener for tab update
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url.includes("atlassian") && changeInfo.status === "complete") {
    const ticketNumber = extractTicketNumber(tab.url); // Implement your logic to extract the ticket number from the URL
    if (!ticketNumber) {
      chrome.browserAction.setBadgeText({ text: "", tabId: tabId });
    } else {
      tabData[tabId].url = tab.url;
    }
  }
});

// Listener for tab removal
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabData[tabId]) {
    updateTabData(tabId);
    // Log or process the tab duration and active time as needed
    // delete tabData[tabId];
  }
});

// Listener for tab focus change
chrome.tabs.onActivated.addListener(function (activeInfo) {
  const tabId = activeInfo.tabId;
  if (tabData[tabId]) {
    updateTabData(tabId);
    updateBadge(tabId);
  }
});

// Function to periodically update tab data
setInterval(function () {
  chrome.browserAction.setPopup({ popup: "" });
  updateAllTabData();
}, 1 * 30 * 1000); // Update every 5 minutes

// Initial tab data update on extension launch
chrome.runtime.onStartup.addListener(function () {
  updateAllTabData();
});

// Function to get the ticket numbers and their durations in a sorted array
// Function to get sorted ticket data based on duration
function getSortedTickets() {
  const sortedTickets = Object.values(tabData)
    .filter((tab) => tab.ticketNumber !== null && tab.duration >= 1 * 30 * 1000)
    .sort((a, b) => b.duration - a.duration)
    .map((tab) => ({
      ticketNumber: tab.ticketNumber,
      duration: tab.duration,
    }));

  return sortedTickets;
}

// Function to create popover content based on sorted ticket data
function createPopoverContent(sortedTickets) {
  let content = "<ul>";
  sortedTickets.forEach((ticket) => {
    const hours = Math.floor(ticket.duration / (60 * 60 * 1000));
    const minutes = Math.floor(
      (ticket.duration % (60 * 60 * 1000)) / (60 * 1000)
    );
    content += `<li>${ticket.ticketNumber}: ${hours} hr ${minutes} min</li>`;
  });
  content += "</ul>";
  return content;
}

// Listener for extension click
chrome.browserAction.onClicked.addListener(function (tab) {
  updateAllTabData();

  const sortedTickets = getSortedTickets();
  const popoverContent = createPopoverContent(sortedTickets);
  chrome.browserAction.setPopup({ popup: "popover.html" });

  setTimeout(function () {
    chrome.runtime.sendMessage({ popoverContent: popoverContent });
  }, 1000);
});

// Initial tab data update on extension install/update
chrome.runtime.onInstalled.addListener(function () {
  updateAllTabData();
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "popup") {
    port.onDisconnect.addListener(function () {
      console.log("popup has been closed");
      chrome.browserAction.setPopup({ popup: "" });
    });
  }
});
