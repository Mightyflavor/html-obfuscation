import fs from "fs";
import path from "path";

// Function to generate a random obfuscation span (CSS `content` property injection)
function randomObfuscationSpan() {
    const randomString = Math.random().toString(36).substring(2, 6);
    return `<span style='content:"${randomString}";'></span>`;
}

// Function to inject zero-width characters
function injectZeroWidthCharacters(text) {
    const zeroWidthChars = ["&#x200B;", "&#x200C;", "&#x200D;", "&#x2060;"];
    return text.replace(/([a-zA-Z0-9])/g, (match) => {
        let zwChar = zeroWidthChars[Math.floor(Math.random() * zeroWidthChars.length)];
        return match + zwChar;
    });
}

// Function to obfuscate text while keeping HTML structure intact
function obfuscateText(text) {
    let obfuscated = text.replace(/([a-zA-Z0-9])/g, (match) => {
        return match + randomObfuscationSpan();
    });
    return injectZeroWidthCharacters(obfuscated); // Adds zero-width characters for anti-detection
}

// Function to replace links while keeping the original button/link appearance intact
function replaceLinks(html) {
    return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>(.*?)<\/a>/gis, (match, beforeHref, url, afterHref, text) => {
        let fakeRedirect = "https://t.ly/" + Math.random().toString(36).substring(2, 8); // Generate a fake short link
        let obfuscatedText = obfuscateText(text); // Obfuscate displayed link text

        // Return the full <a> tag but with the fake redirect while keeping the original styles intact
        return `<a ${beforeHref}href="${fakeRedirect}" ${afterHref}>${obfuscatedText}</a>`;
    });
}



// API Handler to serve the obfuscated HTML while preserving styles
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

        // Obfuscate all links while keeping styling intact
        modifiedHTML = replaceLinks(modifiedHTML);

    
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
