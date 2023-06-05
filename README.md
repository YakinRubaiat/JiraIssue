# 🕑 Jira Ticket Time Tracker - Chrome Extension

This is a Google Chrome extension that helps you keep track of how long you've spent on each Jira ticket. It automatically tracks the amount of time each Jira ticket's tab is open in your Chrome browser, and displays the accumulated time in a popup.

## 🎯 Features

- 🔍 Automatically tracks time spent on each Jira ticket based on the tab's open time.
- ⏱️ The extension updates the active time every 5 minutes if a Jira ticket's tab remains open.
- 💾 Data is persisted for 24 hours.
- 🗂️ Filtering mechanism to only display tickets that have been open for more than 15 minutes.
- 🗑️ Easy to clear all the data with a single click.
- 🎨 Nice and clean UI with a sortable list of tickets.

## 🛠️ How it Works

- The extension listens to the chrome.tabs.onUpdated event to identify when you're viewing a Jira ticket.
- A background script runs at intervals to update the active time for each Jira ticket.
- Another background script runs at intervals to clear out old data (older than 24 hours).
- The extension's popup fetches data from Chrome's local storage and updates the UI.

## 💻 Installation

1. Clone the repository to your local machine.
2. Open Google Chrome and navigate to chrome://extensions.
3. Enable Developer mode in the top right corner.
4. Click Load unpacked and select the directory where you cloned the repository.

⚠️ Please note that you must keep the cloned repository on your machine for the extension to continue working.

## 🎬 Usage

- Open a Jira ticket in your browser.
- Click on the extension icon to view the active time for each Jira ticket.
- Click on the refresh icon in the popup to clear all data.

## 🚀 Future Improvements

- Add settings to customize the time update interval.
- Add more filters to the ticket list.

## 📜 License

This project is licensed under the MIT License.
