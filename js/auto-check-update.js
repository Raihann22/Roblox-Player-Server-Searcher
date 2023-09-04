const githubOwner = "Raihann22";
const githubRepo = "Roblox-Player-Server-Searcher";

fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}/releases/latest`).then(x => x.json()).then(result => {
    const currentVersion = chrome.runtime.getManifest().version;
    const availableVersion = result.tag_name.slice(1);

    if (currentVersion !== availableVersion) {
        chrome.storage.local.get("RPSS", function (result) {
            const currentDate = Date.now();

            if ((currentDate - result.RPSS.lastUpdateAlert) / (1000 * 60 * 60) > 24) { // only show once every 24 hours
                showUpdate(currentVersion, availableVersion);

                result.RPSS.lastUpdateAlert = currentDate;
                chrome.storage.local.set({ "RPSS": result.RPSS });
            }
        });
    }
}).catch(() => {
    console.log("RPSS: Failed to check update!");
})

// showUpdate("for", "test");
function showUpdate(currentVersion, availableVersion) {
    fetch(chrome.runtime.getURL("html/new-update.html")).then(result => result.text()).then(html => {
        const updateAlert = document.createElement("div");
        const body = document.body;
        body.firstChild ? body.insertBefore(updateAlert, body.firstChild) : body.appendChild(updateAlert);
        updateAlert.outerHTML = html;

        const container = document.getElementById("RPSS-ACU-Container");
        container.children[0].style.backgroundImage = `url(${chrome.runtime.getURL("svg/close.svg")}`;      // close icon
        container.children[3].children[0].children[1].innerText = `v${currentVersion}`;                     // current version
        container.children[3].children[1].children[1].innerText = `v${availableVersion}`;                   // available version
        container.lastElementChild.href = `https://github.com/${githubOwner}/${githubRepo}#readme`;         // link to readme

        container.children[0].addEventListener("click", () => {                                             // close alert
            container.hidden = true;
        });
    });
}