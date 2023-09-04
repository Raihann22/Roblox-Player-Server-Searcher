const sleep = time => new Promise(x => setTimeout(x, time));

(async () => {
    await new Promise(x => setTimeout(x, 3000));

    const userInput = document.getElementById("RPSS-UserInput");
    const progressBar = document.getElementById("RPSS-ProgressBar");
    const searchButton = document.getElementById("RPSS-SearchButton");


    userInput.addEventListener("input", () => {
        searchButton.children[0].style.backgroundImage = "url('https://tr.rbxcdn.com/59f4dbf786e05b0900ec6dbffd296035/150/150/AvatarHeadshot/Png/isCircular')";
        progressBar.style.width = "0%";

        if (userInput.value.length < 3 || userInput.value.length > 20) {
            searchButton.style.cursor = "not-allowed";
            searchButton.disabled = true;
        } else {
            searchButton.style.cursor = "";
            searchButton.disabled = false;
        }
    });
    userInput.onkeydown = (event) => { return /[a-z0-9_]/i.test(event.key) };


    searchButton.addEventListener("click", async () => {
        await chrome.storage.local.get(null, async (RPSS) => {
            if (!RPSS.EULA) {
                await fetch(chrome.runtime.getURL("html/eula.html")).then(result => result.text()).then(html => {
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
            } else {
                userInput.disabled = true;
                userInput.style.cursor = "wait";
                searchButton.style.cursor = "wait";
                searchButton.disabled = true;

                const targetPlayer = userInput.value;
                const placeId = Number((window.location.href).match(/\/games\/(\d+)\//)[1]);
                const gameId = await findPlayer(targetPlayer, progressBar, placeId);

                if (gameId) {
                    const joinButton = document.createElement("button");
                    joinButton.setAttribute("onclick", `Roblox.GameLauncher.joinGameInstance(${placeId}, "${gameId}")`);

                    await sleep(10000);
                    joinButton.click();
                    await sleep(500);
                    joinButton.remove();
                } else {
                    await sleep(500);
                    alert("Player not found!");
                }

                userInput.disabled = false;
                userInput.style.cursor = "";
                searchButton.style.cursor = "";
                searchButton.disabled = false;
            }
        });
    });

})();

async function findPlayer(targetPlayer, progressBar, placeId) {
    const searchButtonAvatar = document.getElementById("RPSS-SearchButtonAvatar");
    const playerAvatarHeadshot = await fetchPlayerAvatarHeadshot();

    if (!targetPlayer) return;
    searchButtonAvatar.style.backgroundImage = `url(${playerAvatarHeadshot})`;

    let allTokens = [];
    await fetchServers("");
    return await fetchTokens();



    async function fetchPlayerAvatarHeadshot() {
        if (!/^\d+$/.test(targetPlayer)) {
            await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: { "accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    "usernames": [targetPlayer],
                    "excludeBannedUsers": true
                })
            }).then(x => x.json()).then(x => targetPlayer = x.data[0]?.id);
        }
        if (!targetPlayer) return;

        return fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${targetPlayer}&size=150x150&format=Png&isCircular=true`)
            .then(x => x.json()).then(x => { return x.data[0].imageUrl });
    }

    async function fetchServers(nextPageCursor) {
        await fetch(`https://games.roblox.com/v1/games/${placeId}/servers/0?limit=100&cursor=${nextPageCursor}`).then(x => x.json()).then(async servers => {
            const { nextPageCursor, data } = servers;
            await Promise.all(data.map(server => {
                server.playerTokens.forEach(playerToken => {
                    allTokens.push(
                        {
                            requestId: server.id,
                            token: playerToken,
                            type: "AvatarHeadshot",
                            size: "150x150",
                            format: "png",
                            isCircular: true
                        }
                    )
                })
            }));

            if (!nextPageCursor) return
            return fetchServers(nextPageCursor);
        })
    }

    async function fetchTokens() {
        const onePercent = allTokens.length / 100;

        let readyToFetch = [];
        let checked = 0;
        let foundUser;

        for (let i = 0; i < allTokens.length; i++) {
            checked++
            readyToFetch.push(allTokens[i]);
            if (checked == 100 || i == allTokens.length - 1) {
                await fetch('https://thumbnails.roblox.com/v1/batch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(readyToFetch)
                }).then(x => x.json()).then(x => {
                    return x.data.forEach(data => {
                        if (data.imageUrl === playerAvatarHeadshot) {
                            foundUser = data.requestId;
                            i = allTokens.length;
                        }
                    })
                })

                progressBar.style.width = `${Math.floor(i / onePercent) + 1}%`
                readyToFetch = [];
                checked = 0;
                await sleep(50)
            }
        }
        return foundUser
    }
}