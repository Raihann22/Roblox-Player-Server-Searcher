export function join(gameId, avatar, username, customServer) {
    loading(avatar, username, customServer);

    const joinButton = document.createElement("button");
    joinButton.setAttribute("onclick", `Roblox.GameLauncher.joinGameInstance(${PLACE_ID}, "${gameId}")`);
    joinButton.click();
    joinButton.remove();
}

function loading(avatar, username, customServer) {
    let stageOneHeight;
    const observer = new MutationObserver((mutationsList, observer) => {
        const element = document.getElementById("simplemodal-container");
        if (element) {
            if (!stageOneHeight) {
                stageOneHeight = element.style.height;

                element.innerHTML = JOIN_HTML;
                element.children[0].children[0].src = avatar.replace("isCircular", "noFilter");
                element.children[0].children[1].innerHTML = customServer ? `@${username} is in a custom server.` : `Joining @${username}`;
                
                if (customServer) {
                    element.children[0].children[1].style.fontSize = "20px";
                    element.children[0].children[2].style.display = "unset";
                }
            } else if (stageOneHeight !== element.style.height) {
                observer.disconnect();
                document.getElementById("simplemodal-container").classList.add("RPSS-Joining-StageTwo");
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}