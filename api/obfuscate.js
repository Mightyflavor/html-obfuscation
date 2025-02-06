import fs from "fs";
import path from "path";

function simpleObfuscateText(text) {
    return text.replace(/([a-zA-Z])/g, "$1\u200B"); // Inserts zero-width spaces between characters
}

function obfuscateHref(link) {
    return "https://t.ly/" + Math.random().toString(36).substring(2, 8); // Generate a fake short link
}

function replaceLinks(html) {
    return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>(.*?)<\/a>/gis, (match, beforeHref, url, afterHref, text) => {
        let obfuscatedHref = obfuscateHref(url); // Obfuscate only the `href`
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
