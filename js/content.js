autoCheckUpdate();



function autoCheckUpdate() {
    const githubOwner = "Raihann22";
    const githubRepo = "Roblox-Player-Server-Searcher";

    let RPSS;
    const currentDate = Math.floor(Date.now() / 1000);

    chrome.storage.local.get(null, async (res) => {
        RPSS = res;
        const oneDay = ((currentDate - RPSS.lastUpdateAlert) / (60 * 60)) > 24;

        /**
         *  [oneDay] will be false if user choose 'Remind in 24 hours', if its pass 24 hours, it will be true
         *  if its equal or more than 24 hours, it will check if there an update every 30 minutes (only when change tab/reload)
         *  if its 30 mins cooldown and there is new version, it will use the cache instead fatching again to save rate limit API
         */

        if (!oneDay || ((currentDate - RPSS.lastCheckUpdate) / 60) < 30) {
            if (!RPSS.cacheLatestVersion) return;
        } else {
            RPSS.cacheLatestVersion = "";
        }

        const [availableVersion, changelog] = await fetchVersion();

        // if there is no newer version or user skip the new version, it will return
        if (!availableVersion || availableVersion === RPSS.skipUpdateVersion) return;

        const currentVersion = chrome.runtime.getManifest().version;
        if (thereIsNewVersion(currentVersion.split("."), availableVersion.split("."))) {
            const updateAlert = await showUpdate(currentVersion, availableVersion, changelog);
            updateAlert.style.visibility = "visible";

            document.getElementById("RPSS-ACU-SkipVersion").addEventListener("click", async () => {
                updateAlert.parentNode.removeChild(updateAlert);
                await chrome.storage.local.set({
                    skipUpdateVersion: availableVersion,
                    cacheLatestVersion: "",
                    cacheLatestChangelogMarkdown: ""
                });
            });

            document.getElementById("RPSS-ACU-RemindLater").addEventListener("click", async () => {
                updateAlert.parentNode.removeChild(updateAlert);
                await chrome.storage.local.set({
                    lastUpdateAlert: currentDate,
                    cacheLatestVersion: "",
                    cacheLatestChangelogMarkdown: ""
                });
            });

            document.getElementById("RPSS-ACU-ManualUpdate").addEventListener("click", () => {
                window.open(`https://github.com/${githubOwner}/${githubRepo}#how-to-download-and-install-or-update`, "_blank");
            });

            await chrome.storage.local.set({ cacheLatestVersion: availableVersion });
        } else {
            // clearing cache to save storage
            await chrome.storage.local.set({
                lastCheckUpdate: currentDate,
                cacheLatestVersion: "",
                cacheLatestChangelogMarkdown: ""
            });
        }
    });

    async function fetchVersion() {
        if (RPSS.cacheLatestVersion) {
            return [RPSS.cacheLatestVersion];
        }

        return await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/releases/latest`).then(async response => {
            const isRateLimitExceeded = response.status === 403;
            const rateLimitReset = Number(response.headers.get("x-ratelimit-reset")) - 1740;
            const result = await response.json();
            const version = result.tag_name;

            await chrome.storage.local.set({ lastCheckUpdate: isRateLimitExceeded ? rateLimitReset : currentDate });

            if (isRateLimitExceeded || !version) return;
            return [version.slice(1), result.body];
        });
    }

    function thereIsNewVersion(version1, version2) {
        // Loop through each segment of the versions
        for (let i = 0; i < version1.length; i++) {
            let v1 = parseInt(version1[i], 10);
            let v2 = parseInt(version2[i], 10);

            // Compare corresponding segments
            if (v2 > v1) {
                return true;  // version2 is newer
            } else if (v1 > v2) {
                return false; // version1 is newer
            }
            // If they are equal, move to the next segment
        }
        // If all segments are equal, return false
        return false;
    }

    async function showUpdate(currentVersion, availableVersion, changelog) {
        return await fetch(chrome.runtime.getURL("resources/html/new-update.html")).then(x => x.text()).then(async html => {
            let updateAlert = document.createElement("div");
            const body = document.body;
            body.firstChild ? body.insertBefore(updateAlert, body.firstChild) : body.appendChild(updateAlert);
            updateAlert.outerHTML = html;

            const changelogDiv = document.createElement('div');
            changelogDiv.style = "margin-top: 10px; margin-bottom: 10px;"
            changelogDiv.innerHTML = RPSS.cacheLatestVersion ? RPSS.cacheLatestChangelogMarkdown : await githubMarkdown(changelog);
            document.getElementById("RPSS-ACU-Changelog").appendChild(changelogDiv);

            document.getElementById("RPSS-ACU-CurrentVersion").innerText = `v${currentVersion}`;
            document.getElementById("RPSS-ACU-NewVersion").innerText = `v${availableVersion}`;

            return document.getElementById("RPSS-ACU-Container").parentNode;
        });
    }

    async function githubMarkdown(changelog) {
        return await fetch('https://api.github.com/markdown', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify({ text: changelog.replaceAll("\\", "\\\\") })
        }).then(res => res.text()).then(async markdownHTML => {
            await chrome.storage.local.set({ cacheLatestChangelogMarkdown: markdownHTML });
            return markdownHTML;
        });
    }
}