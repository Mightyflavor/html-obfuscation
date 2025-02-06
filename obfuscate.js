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

function simpleObfuscateText(text) {
    return text.replace(/([a-zA-Z])/g, "$1\u200B"); // Inserts zero-width spaces between characters
}

function replaceLinks(html) {
    return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>(.*?)<\/a>/gis, (match, beforeHref, url, afterHref, text) => {
        let obfuscatedHref = getRandomObfuscatedHref(); // Get a random link from `links.txt`
        let obfuscatedText = simpleObfuscateText(text); // Light obfuscation for button text

        return `<a ${beforeHref}href="${obfuscatedHref}" ${afterHref}>${obfuscatedText}</a>`;
    });
}

function obfuscateVisibleText(html) {
    return html.replace(/>([^<>]+)</g, (match, text) => {
        if (text.trim() !== "") {
            return ">" + simpleObfuscateText(text) + "<"; // Obfuscates only visible text
        }
        return match;
    });
}



export default async function handler(req, res) {
    try {
        const filePath = path.join(process.cwd(), "index.html");

        let html = fs.readFileSync(filePath, "utf-8");

        let modifiedHTML = obfuscateVisibleText(html);

        modifiedHTML = replaceLinks(modifiedHTML);



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
