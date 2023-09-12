const observer = new MutationObserver((mutationsList, observer) => {
    const element = document.querySelector(".server-list-options");
    if (element?.children?.length === 2) {
        observer.disconnect();
        chrome.runtime.sendMessage({ msg: "RPSS_Run_search-layout.js" });
    }
});

observer.observe(document.body, { childList: true, subtree: true });