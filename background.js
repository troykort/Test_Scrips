chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("kamera-express.nl")) {
        console.log("🔄 Tab updated, injecting script...");
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        });
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "takeScreenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Error capturing screenshot:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
                return;
            }

            // Generate timestamped filename
            let now = new Date();
            let formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            let formattedTime = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
            let filename = `screenshot_${formattedDate}_${formattedTime}.png`;

            // Download the screenshot and save it directly in Downloads
            chrome.downloads.download({
                url: image,
                filename: filename,
                saveAs: false // Ensures automatic saving
            });

            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for sendResponse
    }
});