function extractTicketNumber(url) {
  const match = url.match(
    /https:\/\/.*\.atlassian.net\/browse\/([A-Z]+-\d+)(\?.*)?/
  );
  return match ? match[1] : null;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes(".atlassian.net")) {
    const ticket = extractTicketNumber(tab.url);
    if (ticket) {
      chrome.storage.local.get(ticket, (data) => {
        if (data[ticket]) {
          data[ticket].lastUpdateTime = Date.now();
        } else {
          data[ticket] = {
            totalActiveTime: 0,
            lastUpdateTime: Date.now(),
            url: tab.url, // Save the URL
          };
        }
        chrome.storage.local.set(data);
      });
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.tabs.get(tabId, (tab) => {
    const ticket = extractTicketNumber(tab.url);
    if (ticket) {
      chrome.storage.local.get(ticket, (data) => {
        if (data[ticket]) {
          data[ticket].lastUpdateTime = null;
          chrome.storage.local.set(data);
        }
      });
    }
  });
});

setInterval(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const url = tab.url;
      if (url.includes(".atlassian.net")) {
        const ticket = extractTicketNumber(url);
        if (ticket) {
          chrome.storage.local.get(ticket, (data) => {
            if (data[ticket] && data[ticket].lastUpdateTime) {
              const activeTime = Date.now() - data[ticket].lastUpdateTime;

              data[ticket].totalActiveTime += activeTime;
              data[ticket].lastUpdateTime = Date.now();

              chrome.storage.local.set(data);
            }
          });
        }
      }
    });
  });
}, 1 * 60 * 1000);

setInterval(() => {
  const now = Date.now();
  chrome.storage.local.get(null, (data) => {
    for (const [ticket, value] of Object.entries(data)) {
      if (now - value.lastUpdated > 24 * 60 * 60 * 1000) {
        chrome.storage.local.remove(ticket);
      }
    }
  });
}, 60 * 60 * 1000); // run every hour
