chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("kamera-express.")) {
        console.log("🔄 Tab updated, injecting script...");
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showNotification") {
        console.log("📢 Notification request received.");
        
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",  // You can add an icon file to your extension folder
            title: "Checkout Reached!",
            message: "✅ The script has successfully reached the iDEAL payment page.",
            priority: 2
        });

        sendResponse({ success: true });
    }
});