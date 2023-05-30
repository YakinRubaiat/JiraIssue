chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.popoverContent) {
    const popoverContent = message.popoverContent;

    console.log(popoverContent);

    document.getElementById("popover-content").innerHTML = popoverContent;
  }
});

chrome.runtime.connect({ name: "popup" });
