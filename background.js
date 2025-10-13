chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["arrows.css"],
    });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["arrows.js"],
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture") {
        chrome.tabs.captureVisibleTab(
            sender.tab.windowId,
            { format: "png" },
            (imageUri) => {
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: "imageCaptured",
                    imageUri: imageUri,
                });
            }
        );
        return true;
    }
});
