document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ action: 'populateData'});
  chrome.runtime.sendMessage({ action: 'resetCounter'});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // NOTE: Console doesn't seem to output to anything here!
  if (message.action === 'showData') {
    document.getElementById('data').innerHTML = message.data;
    fixHyperlinks();
  }
});

function fixHyperlinks(){
    // Can't use normal hyperlinks in popup. 
    // Have to override behaviour with JS to open a new tab.
    let as = document.getElementsByTagName("a");
    for(let a of as){
        console.log(a.href);
        if(a.href){
            a.addEventListener('click', function (event) {
                event.preventDefault();
                chrome.tabs.create({ url: a.href });
            });
        }
    }
}