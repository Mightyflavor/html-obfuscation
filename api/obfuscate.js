import fs from "fs";
import path from "path";

function getRandomObfuscatedHref() {
    try {
        const filePath = path.join(process.cwd(), "links.txt");
        const links = fs.readFileSync(filePath, "utf-8").split("\n").map(link => link.trim()).filter(Boolean);
        if (links.length === 0) return "https://t.ly/default"; // Fallback if file is empty
        return links[Math.floor(Math.random() * links.length)]; // Select a random link
    } catch (error) {
        console.error("Error reading links.txt:", error);
        return "https://t.ly/default"; // Fallback URL
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

function generateFakeTrackingID() {
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += Math.floor(Math.random() * 999999).toString().padStart(6, "0") + "-";
    }
    return id.slice(0, -1);
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
