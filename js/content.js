chrome.storage.local.get(null, async (RPSS) => {
    if (RPSS.EULA === undefined) {
        RPSS = {
            "EULA": false,
            "lastCheckUpdate": 0,
            "lastUpdateAlert": 0
        }
        await chrome.storage.local.set(RPSS);
    }
    await chrome.runtime.sendMessage({ msg: "RPSS_Run_auto-check-update.js" });

    if (/^https:\/\/.*\.roblox\.com\/games\/.*/.test(window.location.href)) {
        let done;
        
        waitForServerListOptions();
        if (!done) window.addEventListener("hashchange", waitForServerListOptions);

        function waitForServerListOptions() {
            if (window.location.hash.endsWith("game-instances")) {
                if (done === false) window.removeEventListener("hashchange", waitForServerListOptions);
                chrome.runtime.sendMessage({ msg: "RPSS_Run_wait-for-server-list-options.js" });

                return done = true;
            }
            done = false;
        }
    }
});