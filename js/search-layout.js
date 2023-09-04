const serverListOptions = document.getElementsByClassName("server-list-options")[0];

const container = document.createElement("div");
container.id = "RPSS-Container";



const inputAndProgressContainer = document.createElement("div");
inputAndProgressContainer.id = "RPSS-InputAndProgressContainer"

const userInput = document.createElement("input");
userInput.id = "RPSS-UserInput";
userInput.type = "text";
userInput.maxLength = "20";
userInput.spellcheck = "false";
userInput.autocomplete = "off";
userInput.autocapitalize = "off";

const progressBarContainer = document.createElement("div");
progressBarContainer.id = "RPSS-ProgressBarContainer";

const progressBar = document.createElement("div");
progressBar.id = "RPSS-ProgressBar";



const searchButton = document.createElement("button");
searchButton.id = "RPSS-SearchButton";
searchButton.disabled = true;
searchButton.style.cursor = "not-allowed";

const searchButtonAvatar = document.createElement("span");
searchButtonAvatar.id = "RPSS-SearchButtonAvatar";

const searchButtonMagnifier = document.createElement("span");
searchButtonMagnifier.id = "RPSS-SearchButtonMagnifier";
searchButtonMagnifier.style.backgroundImage = `url(${chrome.runtime.getURL("svg/magnifier.svg")})`;


searchButton.append(searchButtonAvatar, searchButtonMagnifier);
progressBarContainer.append(progressBar);
inputAndProgressContainer.append(userInput, progressBarContainer);
container.append(inputAndProgressContainer, searchButton);
serverListOptions.append(container);

chrome.runtime.sendMessage({ action: "RPSS_Run_searcher.js" });