const sleep = time => new Promise(x => setTimeout(x, time));

const userInput = document.getElementById("RPSS-UserInput");
const searchButton = document.getElementById("RPSS-SearchButton");
const warningContainer = document.getElementById("RPSS-PSA-Container");
const warningText = document.getElementById("RPSS-PSA-Warning");

userInput.addEventListener("input", () => {
    userInput.value = userInput.value.replace(/[^a-zA-Z0-9_]/g, '');

    searchButton.children[0].style.backgroundImage = "url('https://tr.rbxcdn.com/59f4dbf786e05b0900ec6dbffd296035/150/150/AvatarHeadshot/Png/isCircular')";
    PROGRESS_BAR.style.width = "0%";
    warningContainer.style.transform = "translateX(180px)";

    if (userInput.value.length < 3 || userInput.value.length > 20) {
        searchButton.style.cursor = "not-allowed";
        searchButton.disabled = true;
    } else {
        searchButton.style.cursor = "";
        searchButton.disabled = false;
    }
});


searchButton.addEventListener("click", async () => {
    await chrome.storage.local.get(null, async (RPSS) => {
        if (!RPSS.EULA) return showEULA(RPSS);

        disableInptBtn(true);

        const result = await findPlayer();
        switch (result[0]) {
            /**
             *  0 = User doesn't exist.
             *  1 = Player offline.
             *  2 = Player online.
             *  3 = Player in studio.
             *  4 = No Server.
             *  5 = Player not in this game.
             *  6 = Player in a different game.
             */

            case 0:
                warningText.innerHTML = "User doesn't exist!";
                break;

            case 1:
                warningText.innerHTML = "Player is offline!";
                break;

            case 2:
                warningText.innerHTML = "Player is online, but not in a game.";
                break;

            case 3:
                warningText.innerHTML = "Player is in Roblox Studio!";
                break;

            case 4:
                warningText.innerHTML = "No Servers Found!";
                break;

            case 5:
                warningText.innerHTML = "Player not found in this game!";
                break;

            case 6:
                PLAYER_IN_OTHER_GAME_JS.showAlert(result[1], result[2], result[3]);
                break;

            default:
                // player found!
                PROGRESS_BAR.style.width = "100%";

                const gameId = result[0].toString().length > 1 ? result[0] : result[1];
                const avatar = result[0].toString().length > 1 ? result[1] : result[2];
                const username = result[0].toString().length > 1 ? result[2] : result[3];

                JOIN_JS.join(gameId, avatar, username);
                break;
        }
        if (typeof result[0] === "number" && result[0] <= 5) warningContainer.style.transform = "translateX(0px)";

        disableInptBtn(false);
    });
});



function showEULA(RPSS) {
    fetch(chrome.runtime.getURL("resources/html/eula.html")).then(result => result.text()).then(html => {
        const eulaAlert = document.createElement("div");
        eulaAlert.innerHTML = html;

        const body = document.body;
        body.firstChild ? body.insertBefore(eulaAlert, body.firstChild) : body.appendChild(eulaAlert);

        const agreeCheckbox = document.getElementById("RPSS-AGMT-Agree");
        const countdown = document.getElementById("RPSS-AGMT-Countdown");

        let countdownInterval;
        agreeCheckbox.addEventListener("change", (event) => {
            clearInterval(countdownInterval);

            if (event.target.checked) {
                let secondsRemaining = 10;
                countdown.innerText = `Applying in ${secondsRemaining--} seconds`;

                countdownInterval = setInterval(() => {
                    countdown.innerText = `Applying in ${secondsRemaining--} seconds`;

                    if (secondsRemaining < 0) {
                        clearInterval(countdownInterval);
                        eulaAlert.hidden = true;

                        RPSS.EULA = true;
                        chrome.storage.local.set(RPSS);
                    }
                }, 1000);
            } else {
                countdown.innerText = '';
            }
        });
    });
}

function disableInptBtn(disable) {
    userInput.disabled = disable;
    searchButton.disabled = disable;

    userInput.style.cursor = disable ? "wait" : "";
    searchButton.style.cursor = disable ? "wait" : "";
}



async function findPlayer() {
    PROGRESS_BAR.style.width = `0%`
    warningContainer.style.transform = "translateX(180px)";

    let targetPlayer = userInput.value;
    let username;
    const playerAvatarHeadshot = await fetchPlayerAvatarHeadshot();
    if (!targetPlayer) return [0];

    const avatarImageUrl = playerAvatarHeadshot.state === "Completed" ? playerAvatarHeadshot.imageUrl : chrome.runtime.getURL("resources/svg/error-404.svg");
    const searchButtonAvatar = document.getElementById("RPSS-SearchButtonAvatar");
    searchButtonAvatar.style.backgroundImage = `url(${avatarImageUrl})`;

    const playerStatus = await checkStatus();
    if (playerStatus[0] !== 4) return playerStatus;

    let allTokens = [];
    await fetchServers("");
    return await fetchTokens();



    async function fetchPlayerAvatarHeadshot() {
        if (!/^\d+$/.test(targetPlayer)) {  // getting target's userId if searching using username
            username = targetPlayer;
            await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: { "accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    "usernames": [targetPlayer],
                    "excludeBannedUsers": true
                })
            }).then(x => x.json()).then(res => targetPlayer = res.data[0]?.id);
        }
        if (!targetPlayer) return;
        if (!username) username = await fetch(`https://users.roblox.com/v1/users/${targetPlayer}`).then(x => x.json()).then(res => res.name);

        return await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${targetPlayer}&size=150x150&format=Png&isCircular=true`).then(x => x.json()).then(res => {
            if (res.errors || res.data.length === 0) return targetPlayer = undefined;    // if userId doesn't exist
            return res.data[0];
        });
    }

    async function checkStatus() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ msg: "Fetch_PresenceApi", content: targetPlayer }, (response) => {
                const statusId = response.userPresenceType;
                const statusPlaceId = response.placeId;
                let status = [];

                if (statusId < 2 || statusId === 3) {
                    status.push(statusId === 3 ? statusId : statusId + 1);
                } else {
                    status.push(4);
                    if (statusPlaceId !== null) {
                        if (statusPlaceId !== PLACE_ID) {
                            status[0] = 6;
                            status.push(response);
                            PROGRESS_BAR.style.width = "50%";
                        } else {
                            status[0] = 7;
                            status.push(response.gameId);
                        }
                        status.push(avatarImageUrl, username);
                    }
                }

                resolve(status);
            });
        });
    }

    async function fetchServers(nextPageCursor) {
        await fetch(`https://games.roblox.com/v1/games/${PLACE_ID}/servers/0?limit=100&cursor=${nextPageCursor}`).then(x => x.json()).then(async servers => {
            const { nextPageCursor, data } = servers;

            for (let server of data) {
                for (let playerToken of server.playerTokens) {
                    allTokens.push({
                        requestId: server.id,
                        token: playerToken,
                        type: "AvatarHeadshot",
                        size: "150x150",
                        format: "png",
                        isCircular: true
                    });
                }
            }

            if (!nextPageCursor) return;

            await sleep(50)
            return fetchServers(nextPageCursor);
        })
    }

    async function fetchTokens() {
        if (allTokens.length === 0) return [4];

        const onePercent = allTokens.length / 100;
        let readyToFetch = [];
        let checked = 0;
        let foundUser = [avatarImageUrl, username];

        for (let i = 0; i < allTokens.length; i++) {
            checked++
            readyToFetch.push(allTokens[i]);
            if (checked === 100 || i === allTokens.length - 1) {
                await fetch('https://thumbnails.roblox.com/v1/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(readyToFetch)
                }).then(x => x.json()).then(res => {
                    res.data.forEach(data => {
                        if (data.imageUrl === avatarImageUrl) {
                            foundUser.unshift(data.requestId);
                            i = allTokens.length;
                        }
                    });
                });

                PROGRESS_BAR.style.width = `${Math.floor(i / onePercent) + 1}%`;
                readyToFetch = [];
                checked = 0;
                await sleep(50);
            }
        }
        return foundUser[2] ? foundUser : [5];
    }
}