export async function showAlert(infos, avatar, username) {
    const body = document.body;
    const PIOGalert = document.createElement("div");

    PIOGalert.style.visibility = "hidden";
    PIOGalert.innerHTML = PLAYER_IN_OTHER_GAME_HTML;
    body.insertBefore(PIOGalert, body.firstChild);


    const container = document.getElementById("RPSS-PIOG-Container");
    const theAvatar = document.getElementById("RPSS-PIOG-Avatar");
    const theUsername = document.getElementById("RPSS-PIOG-Username");

    theAvatar.src = avatar;
    theUsername.innerHTML = `@${username}`;
    theUsername.href = `https://www.roblox.com/users/${infos.userId}`;

    let noServer = false;
    let divNum = 1;
    let joinUrl = `https://www.roblox.com/games/${infos.rootPlaceId + window.location.hash}&rpss_join=${infos.gameId},${avatar},${username}`;
    if (infos.placeId !== infos.rootPlaceId) {
        await fetch(`https://games.roblox.com/v1/games/${infos.rootPlaceId}/servers/0?excludeFullGames=true&limit=100`).then(x => x.json()).then(servers => {
            const data = servers.data;

            if (!data[0]) {
                joinUrl = joinUrl.split("&rpss_join")[0];
                return noServer = true;
            }
            joinUrl = joinUrl.replace(infos.gameId, data[Math.floor(Math.random() * data.length)].id) + ",customServer";
        });

        const inCustomServer = document.getElementById("RPSS-PIOG-InCustomServer");
        inCustomServer.style.visibility = "unset";

        inCustomServer.children[0].addEventListener("click", () => {
            container.children[0].style.display = "none";
            container.children[1].style.display = "";
            GreenBtn.innerHTML = "Back";
            divNum = 2;
        });
    }


    await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${infos.universeId}&size=150x150&format=Png`).then(x => x.json()).then(result => {
        const game = document.getElementById("RPSS-PIOG-Game");
        game.children[0].src = result.data[0].imageUrl;
        game.children[1].innerHTML = infos.lastLocation;
    });

    const GreenBtn = document.getElementById("RPSS-PIOG-GreenBtn");
    GreenBtn.addEventListener("click", () => {
        if (divNum === 1) return location.replace(joinUrl);
        container.children[0].style.display = "";
        container.children[1].style.display = "none";
        GreenBtn.innerHTML = noServer ? "Go" : "Join";
        divNum = 1;
    });
    document.getElementById("RPSS-PIOG-RedBtn").addEventListener("click", () => PIOGalert.remove());

    PROGRESS_BAR.style.width = "100%"
    PIOGalert.style = "";
}