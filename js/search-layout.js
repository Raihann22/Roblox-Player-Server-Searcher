fetch(chrome.runtime.getURL("html/layout.html")).then(result => result.text()).then(html => {
    const layout = document.createElement("div");    
    const serverListOptions = document.getElementsByClassName("server-list-options")[0];
    serverListOptions.append(layout);
    layout.outerHTML = html;

    chrome.runtime.sendMessage({ msg: "RPSS_Run_searcher.js" });
});