const getVideoFromUrl = url => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v");
}

const blockVideo = _ => {
    const player = document.getElementById("movie_player");

    if (player) {
        player.style.display = "none";
        const blockMsg = document.createElement("div");
        blockMsg.style.cssText = `
            position: fixed;
            inset: 0;
            margin: auto;
            background: #fff;
            font-size: 6rem;
            color: #000;
            text-align: center;
        `;

        blockMsg.textContent = "Video is blocked as it does not appear to be educational. Get back to work!";
        player.parentElement.appendChild(blockMsg);
    }
}

const checkCurrentVideo = _ => {
    const videoId = getVideoFromUrl(window.location.href);

    if (videoId) {
        chrome.runtime.sendMessage(
            { type: "CHECK_VIDEO", videoId },
            response => {
                if (response.shouldBlock) {
                    blockVideo();
                }
            }
        );
    }
}

// observe url changes
let lastUrl = window.location.href;
new MutationObserver(_ => {
    if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        setTimeout(checkCurrentVideo, 1000);
    }
}).observe(document, { childList: true, subtree: true });

// initial check
checkCurrentVideo();