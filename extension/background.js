class BadgeHandler {
  constructor() {
    this.lastKnownCountPulled = null;
    this.lastCountUsedForDiff = null;
  }
  resetCount() {
    console.log("BadgeHandler.resetCount");
    this.lastCountUsedForDiff = this.lastKnownCountPulled;
    this._updateBadge();
  }
  updatePulledCount(count) {
    console.log("BadgeHandler.updatePulledCount: ", count);
    this.lastKnownCountPulled = count;
    this._updateBadge();
  }
  _updateBadge() {
    console.log("BadgeHandler._updateBadge: ", this.lastCountUsedForDiff, this.lastKnownCountPulled);
    if(this.lastCountUsedForDiff === null) {
        this.lastCountUsedForDiff = this.lastKnownCountPulled;
    }
    if(this.lastKnownCountPulled === null) {
        chrome.action.setBadgeText({});
    } else {
        let diff = this.lastKnownCountPulled - this.lastCountUsedForDiff;
        console.log("BadgeHandler._updateBadge diff: ", diff);
        if(diff == 0) {
            chrome.action.setBadgeText({});
        } else if(diff > 99) {
            chrome.action.setBadgeText({ text: ">99" });
        } else {
            chrome.action.setBadgeText({ text: diff.toString() });
        }
    }
  }
}
var badgeHandler = new BadgeHandler();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("background onMessage listener: ", message);
    if (message.action === 'populateData') {
        pullApiData(apiData => {
            chrome.runtime.sendMessage({ action: "showData", data: formatApiData(apiData) });
        });
    }
    if (message.action === 'resetCounter') {
        badgeHandler.resetCount();
    }
});

function pullApiData(callback) {
  const url = 'https://api.github.com/repos/ebu/ear-production-suite/releases';
  console.log("pullApiData Fetching...", url);
  fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log("pullApiData Received: ", data);
        callback(data);
    })
    .catch(error => {
        console.error('pullApiData Error fetching data:', error);
    });
}

function getTotalDownloadsLatestFromApiData(data) {
    for(let d of data) {
        console.log("getTotalDownloadsLatestFromApiData", d);
        if(d.hasOwnProperty("assets")){
            let l = 0;
            let w = 0;
            let m = 0;
            for(let a of d.assets) {
                if(a.name.toLowerCase().includes("mac") || a.name.toLowerCase().endsWith(".dmg")) m += a.download_count;
                if(a.name.toLowerCase().includes("win")) w += a.download_count;
                if(a.name.toLowerCase().includes("linux")) l += a.download_count;
            }
            return m+l+w;
        }
    }
    return null;
}

function formatApiData(data) {
    let op = "";
    for(let d of data) {
        console.log("formatApiData", d);
        if(d.hasOwnProperty("assets")){
            op += "<b><u><a href=\"" + d.html_url + "\">" + d.tag_name + "</a></u></b><br />";
            let l = null;
            let w = null;
            let m = null;
            for(let a of d.assets) {
                if(a.name.toLowerCase().includes("mac") || a.name.toLowerCase().endsWith(".dmg")) m += a.download_count;
                if(a.name.toLowerCase().includes("win")) w += a.download_count;
                if(a.name.toLowerCase().includes("linux")) l += a.download_count;
            }
            let totalDl = m+l+w;
            op += "<b>&#931; " + totalDl.toString() + "</b>&nbsp;&nbsp;&nbsp;";
            op += "&nbsp;&nbsp;&nbsp;<img src=\"img/win.png\" height=\"12\"> " + w;
            op += "&nbsp;&nbsp;&nbsp;<img src=\"img/mac.png\" height=\"12\"> " + m;
            if(l!==null) op += "&nbsp;&nbsp;&nbsp;<img src=\"img/linux.png\" height=\"12\"> " + l;
            op += "<br/>";
            if(d.hasOwnProperty("reactions")){
                if(d.reactions["+1"]) op += "&nbsp;&nbsp;&nbsp;👍 " + d.reactions["+1"];
                if(d.reactions["laugh"]) op += "&nbsp;&nbsp;&nbsp;😄️ " + d.reactions["laugh"];
                if(d.reactions["hooray"]) op += "&nbsp;&nbsp;&nbsp;🎉 " + d.reactions["hooray"];
                if(d.reactions["heart"]) op += "&nbsp;&nbsp;&nbsp;❤️ " + d.reactions["heart"];
                if(d.reactions["rocket"]) op += "&nbsp;&nbsp;&nbsp;🚀️ " + d.reactions["rocket"];
                if(d.reactions["eyes"]) op += "&nbsp;&nbsp;&nbsp;👀 " + d.reactions["eyes"];
                // These two reactions don't even seem to be options in the GitHub web UI
                if(d.reactions["confused"]) op += "&nbsp;&nbsp;&nbsp;'Confused' " + d.reactions["confused"];
                if(d.reactions["-1"]) op += "&nbsp;&nbsp;&nbsp;'-1' " + d.reactions["-1"];
                op += "<br/>";
            }
            op += "<br/>";
        }
    }
    return op;
}

function backgroundApiCheck() {
    console.log("backgroundApiCheck...");
    pullApiData(apiData => {
        let totalDl = getTotalDownloadsLatestFromApiData(apiData);
        console.log("backgroundApiCheck totalDl:", totalDl);
        if(totalDl === null) {
          badgeHandler.resetCount();
        } else {
          badgeHandler.updatePulledCount(totalDl);
        }
    });
}

backgroundApiCheck();
setInterval(backgroundApiCheck, 60000);