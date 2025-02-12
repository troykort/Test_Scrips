console.log("🚀 Auto-cart script loaded. Press Ctrl + Shift + Q to start.");

// Function to wait for an element to appear
async function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(check);
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(check);
                reject(`❌ Timeout: Element '${selector}' not found`);
            }
        }, 500);
    });
}

// Function to click an element
async function clickElement(selector) {
    try {
        const element = await waitForElement(selector);
        element.click();
        console.log(`✅ Clicked: ${selector}`);
    } catch (error) {
        console.error(error);
    }
}

// Function to fill an input field
async function fillInput(selector, value) {
    try {
        const inputField = await waitForElement(selector);
        inputField.value = value;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`✍️ Filled input: ${selector}`);
    } catch (error) {
        console.error(error);
    }
}


// **Step 1: Select a Random Product**
async function selectProduct() {
    console.log("🔍 Searching for available products...");

    // Wait for product links to appear
    await waitForElement("a.product-card-outer-container", 10000);

    // Get all product links from the product cards
    let productLinks = Array.from(document.querySelectorAll("a.product-card-outer-container"));

    if (productLinks.length === 0) {
        console.error("❌ No products found on the page.");
        return;
    }

    // Select a random product
    let randomProduct = productLinks[Math.floor(Math.random() * productLinks.length)];
    
    localStorage.setItem("autoCartRunning", "true");
    localStorage.setItem("step", "1");

    console.log(`✅ Random product selected: ${randomProduct.href}`);
    randomProduct.click();
}

// **Step 2: Click "In Winkelwagen"**
async function addToCart() {
    console.log("⏳ Waiting for product page...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("📜 Scrolling down...");
    window.scrollBy(0, 300);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("🛒 Clicking 'In Winkelwagen'...");
    await clickElement("button.full-width.sf-button[data-dd-action-name='add-to-cart']");

    localStorage.setItem("step", "2");
    await proceedToCheckout();
}

// **Step 3: Click "Bestellen"**
async function proceedToCheckout() {
    console.log("⏳ Waiting for 'Bestellen' button...");
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log("📜 Scrolling Up...");
    window.scrollBy(0,-300);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("📦 Clicking 'Bestellen'...");
    await clickElement("button.sf-button[data-dd-action-name='view-cart']");
    
    localStorage.setItem("step", "3");

    await checkLoginOrProceed();
}
// **Step 4: Check if login is required or proceed**
async function checkLoginOrProceed() {
    console.log("🔍 Checking if login is required...");

    // If step 5 is already set, skip this check
    if (localStorage.getItem("step") === "5") {
        console.log("✅ Already logged in, proceeding to payment...");
        await payWithIdeal();
        return;
    }

    // Click "Doorgaan met bestellen" first
    try {
        console.log("🚀 Clicking 'Doorgaan met bestellen'...");
        await clickElement("button.full-width.sf-button[data-dd-action-name='checkout']");
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait to check for login fields
    } catch (error) {
        console.warn("⚠️ 'Doorgaan met bestellen' button not found, continuing...");
    }

    // Check if login fields exist after clicking "Doorgaan met bestellen"
    const loginEmailField = document.querySelector("input[type='email']");
    const loginPasswordField = document.querySelector("input[type='password']");

    if (loginEmailField && loginPasswordField) {
        console.log("🔐 Login fields detected, proceeding with login...");
        await login();
    } else {
        console.log("🚀 No login required, proceeding to payment...");
        localStorage.setItem("step", "5"); // Ensure step is set correctly
        await payWithIdeal();
    }
}




// **Step 5: Login Process**
async function login() {
    console.log("✍️ Filling in email...");
    await fillInput("input[type='email']", "dtckort@gmail.com");

    console.log("🔒 Filling in password...");
    await fillInput("input[type='password']", "Troy@2025");

    console.log("🔘 Clicking 'Inloggen' button...");
    await clickElement("button.full-width.sf-button[data-v-3e47e698]");

    console.log("🎉 Login process completed!");
    
    // Ensure that step 5 is set before proceeding
    localStorage.setItem("step", "5");

    // Wait for page to load before proceeding to payment
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Proceed directly to payment
    await payWithIdeal();
}


// **Step 6: Click "Betalen met iDEAL" and Send a notification**
async function payWithIdeal() {
    console.log("⏳ Waiting for checkout page to load...");
    await new Promise(resolve => setTimeout(resolve, 12000));

    console.log("🔍 Searching for 'Betalen met iDEAL' button...");
    const idealButton = await waitForElement("button.full-width.sf-button[data-dd-action-name='order-and-pay']", 20000);

    console.log("✅ 'Betalen met iDEAL' button found! Clicking now...");
    idealButton.click();

    console.log("🎉 Payment process initiated!");
    localStorage.setItem("step", "5");

    // Schedule notification step after 30 seconds
    setTimeout(sendNotificationStep, 10000);
}
/*
// **Step 7: Send Notification**
function sendNotificationStep() {
    console.log("📢 Sending notification request...");
    chrome.runtime.sendMessage({ action: "showNotification" }, (response) => {
        if (response && response.success) {
            console.log("✅ Notification displayed!");
        } else {
            console.error("❌ Failed to show notification.");
        }
    });

    // Update localStorage to indicate step 7 is reached
    localStorage.setItem("step", "6");
}
    */

// **Step 7: Send Notification**
function sendNotificationStep() {
    console.log("📢 Checkout completed! Displaying alert.");
    alert("✅ Order process completed!");
}


// **Resume script execution after page reload**
async function resumeScript() {
    console.log("🔄 Resuming auto-cart script...");

    let step = localStorage.getItem("step");

    switch (step) {
        case "1":
            await addToCart();
            break;
        case "2":
            await proceedToCheckout();
            break;
        case "3":
            await checkLoginOrProceed();
            break;
        case "4":
            await login();
            break;
        case "5":
            await payWithIdeal();
            break;
        default:
            console.log("⏹️ No step to resume. Waiting for user input...");
            break;
    }
}

// **Function to start the script on Ctrl + Shift + Q**
function startScript(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
        console.log("🚀 Starting auto-cart script...");
        document.removeEventListener("keydown", startScript);
        localStorage.setItem("autoCartRunning", "true");
        localStorage.setItem("step", "1");

        (async () => {
            await selectProduct();
        })();
    }
}

// **Check if script was running before page reload and continue**
if (localStorage.getItem("autoCartRunning") === "true") {
    resumeScript();
}

// **Listen for Ctrl + Shift + Q to start**
document.addEventListener("keydown", startScript);

// Function to force stop the script
function stopScript() {
    console.log("🛑 Force stopping the auto-cart script...");

    // Clear stored steps
    localStorage.removeItem("autoCartRunning");
    localStorage.removeItem("step");

    // Remove all event listeners
    document.removeEventListener("keydown", startScript);
    console.log("🚫 Auto-cart script stopped!");

    // Optionally, reload the page to fully reset
    location.reload();
}

// Listen for Ctrl + Shift + X to stop the script
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'X') {
        stopScript();
    }
});
