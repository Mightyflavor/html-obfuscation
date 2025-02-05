import fetch from "node-fetch"; // ✅ Use ESM import

// Function to obfuscate text
function obfuscateText(text) {
    return text.replace(/([a-zA-Z0-9])/g, "$1&#x200B;"); // Adds zero-width spaces
}

// API Handler to serve obfuscated HTML
export default async function handler(req, res) {
    try {
        // Fetch original HTML from GitHub Pages (Replace with your actual URL)
        const response = await fetch("https://mightyflavor.github.io/obfuscationnn/IRS_ob"); // Replace with actual URL
        let html = await response.text();

        // Modify HTML before serving
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
