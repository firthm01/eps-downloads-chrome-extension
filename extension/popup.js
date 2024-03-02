document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ action: 'callServiceWorkerFunction' });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // NOTE: Console doesn't refer to anything here!
  if (message.action === 'showData') {
    document.getElementById('data').innerHTML = message.data;
  }
});