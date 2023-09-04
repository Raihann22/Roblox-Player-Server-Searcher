chrome.storage.local.get(null, async (RPSS) => {
    if (RPSS.EULA === undefined) {
        RPSS = {
            "EULA": false,
            "lastUpdateAlert": ""
        }
        await chrome.storage.local.set(RPSS);
    }

    if (/^https:\/\/.*\.roblox\.com\/games\/.*/.test(window.location.href)) {
        let done;
        
        waitForServerListOptions();
        if (!done) window.addEventListener("hashchange", waitForServerListOptions);

        function waitForServerListOptions() {
            if (window.location.hash.endsWith("game-instances")) {
                if (done === false) window.removeEventListener("hashchange", waitForServerListOptions);
                chrome.runtime.sendMessage({ action: "RPSS_Run_wait-for-server-list-options.js" });

                return done = true;
            }
            done = false;
        }
    }
});