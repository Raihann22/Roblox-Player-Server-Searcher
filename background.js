/**
 * GitHub: https://github.com/Raihann22
 * GitHub Repository: https://github.com/Raihann22/Roblox-Player-Server-Searcher
 * LICENSE: https://choosealicense.com/licenses/mit
 * 
 * © 2023 Raihan
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const msg = message.msg;
    const content = message.content;

    switch (msg) {
        case "RPSS_Run_auto-check-update.js":
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id, allFrames: false },
                files: ["js/auto-check-update.js"]
            });
            break;

        case "RPSS_Run_wait-for-server-list-options.js":
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id, allFrames: false },
                files: ["js/wait-for-server-list-options.js"]
            });
            break;

        case "RPSS_Run_search-layout.js":
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id, allFrames: false },
                files: ["js/search-layout.js"]
            });
            break;

        case "RPSS_Run_searcher.js":
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id, allFrames: false },
                files: ["js/searcher.js"]
            });
            break;

        case "Fetch_PresenceApi":
            fetchPresenceApi(content).then(sendResponse);
            return true;
    }
});

async function fetchPresenceApi(userIds) {
    const result = await fetch("https://presence.roblox.com/v1/presence/users", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "userIds": [userIds] })
    }).then(x => x.json());

    return result.userPresences[0];
}