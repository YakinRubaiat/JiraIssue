function extractTicketNumber(url) {
  const match = url.match(/https:\/\/.*\.atlassian.net\/browse\/([A-Z]+-\d+)(\?.*)?/);
  return match ? match[1] : null;
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const ticket = extractTicketNumber(tab.url);
  if (ticket) {
    chrome.storage.local.get(ticket, (data) => {
      let totalActiveTime = 0;
      let start = Date.now();
      if (data[ticket]) {
        totalActiveTime = data[ticket].totalActiveTime || 0;
        start = data[ticket].start || Date.now();
      }
      const now = Date.now();
      if (now - start >= 5 * 60 * 1000) {
        totalActiveTime += now - start;
        start = now;
      }
      const newData = {};
      newData[ticket] = { start, totalActiveTime, lastUpdated: Date.now() }; // added lastUpdated field
      chrome.storage.local.set(newData);
    });
  }
});

setInterval(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const ticket = extractTicketNumber(tab.url);
      if (ticket) {
        chrome.storage.local.get(ticket, (data) => {
          if (data[ticket]) {
            const now = Date.now();
            if (now - data[ticket].start >= 5 * 60 * 1000) {
              data[ticket].totalActiveTime += now - data[ticket].start;
              data[ticket].start = now;
              data[ticket].lastUpdated = now; // update the lastUpdated field
              const newData = {};
              newData[ticket] = data[ticket];
              chrome.storage.local.set(newData);
            }
          }
        });
      }
    });
  });
}, 5 * 60 * 1000);

setInterval(() => {
  const now = Date.now();
  chrome.storage.local.get(null, (data) => {
    for (const [ticket, value] of Object.entries(data)) {
      if (now - value.lastUpdated > 24 * 60 * 60 * 1000) {
        // if data is older than 24 hours
        chrome.storage.local.remove(ticket); // remove this data
      }
    }
  });
}, 60 * 60 * 1000); // run every hour
