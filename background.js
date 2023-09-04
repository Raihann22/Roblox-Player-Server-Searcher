/**
 * GitHub: https://github.com/Raihann22
 * GitHub Repository: https://github.com/Raihann22/Roblox-Player-Server-Searcher
 * LICENSE: https://choosealicense.com/licenses/mit
 * 
 * © 2022 Raihan
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const msg = message.action;

    switch (msg) {
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
    }
});