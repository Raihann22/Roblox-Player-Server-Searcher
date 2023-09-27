/**
 * GitHub: https://github.com/Raihann22
 * GitHub Repository: https://github.com/Raihann22/Roblox-Player-Server-Searcher
 * LICENSE: https://choosealicense.com/licenses/mit
 * 
 * © 2023 Raihan
 */

/**
 * ========== v2.0.0 Change logs ==========
 * - combine/move "wait-for-server-list-options.js" to page-game.js
 * - combine/move "search-layout.js" to page-game.js
 * - combine/move "auto-check-update.js" to content.js
 * - move almost all script in "content.js" to page-game.js
 * - move fonts, html and svg to resources folder
 * - made custom loading joing screen
 * - made from this version when installing newer version, the oldest version auto uninstalling itself
 * - made a popup when searching player in difference game, and can join by clickin Join button on the popup (for player that has Who Can Join set to public)
 * - made join.js
 * - dark and light mode for the serach layout
 * - some adjustment in search layout
 * - add player warning / status card
 * - add preview on readme
 * - and some fixs
 * - add description in the manifest.json
 * - incress version to v2.0.0
 */



// ========== Auto uninstall (Start Line) ==========
let thisExtension;
(async () => thisExtension = await chrome.management.getSelf())();

chrome.runtime.onInstalled.addListener(async details => {   // check if there is a same extension with the same version 
    if (details.reason === "install") {     // creating config
        const RPSS = {
            "EULA": false,
            "lastCheckUpdate": 0,
            "lastUpdateAlert": 0
        }
        await chrome.storage.local.set(RPSS);
    }

    checkSameExtension();
});

chrome.management.onInstalled.addListener(details => {
    if (details.name !== "Roblox Player Server Searcher") return;

    compareVersion(details.version.split("."), thisExtension.version.split("."));      // uninstalling if new version just installed
});

chrome.management.onEnabled.addListener(details => {
    if (details.id !== thisExtension.id) return;

    checkSameExtension();
});

async function checkSameExtension() {
    await chrome.management.getAll(extensions => {
        for (let otherExtension of extensions) {
            if (otherExtension.name !== "Roblox Player Server Searcher" || thisExtension.id === otherExtension.id) continue;

            if (thisExtension.version === otherExtension.version) chrome.management.uninstallSelf();     // cancel installing if the same version already exist

            compareVersion(otherExtension.version.split("."), thisExtension.version.split("."));    // cancel installing if this version is lower than that already exist
        }
    });
}

function compareVersion(version1, version2) {
    for (let i = 0; i < 3; i++) {
        if (version1[i] > version2[i]) {
            chrome.management.uninstallSelf();
            break;
        }
    }
}
// ========== Auto uninstall (End Line) ==========



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const msg = message.msg;
    const content = message.content;
    const tabId = sender.tab.id;

    switch (msg) {
        case "RPSS_Run_searcher.js":
            chrome.scripting.executeScript({
                target: { tabId, allFrames: false },
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