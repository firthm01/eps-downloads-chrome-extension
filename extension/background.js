chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'populateData') {
    pullApiData();
  }
});

function pullApiData() {
  const url = 'https://api.github.com/repos/ebu/ear-production-suite/releases';
  console.log("Fetching...", url);
  fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log("pullApiData", data);
        chrome.runtime.sendMessage({ action: "showData", data: formatApiData(data) });
    })
    .catch(error => console.error('Error fetching data:', error));
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
            op += "<b>&#931; " + (m+l+w) + "</b>&nbsp;&nbsp;&nbsp;";
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