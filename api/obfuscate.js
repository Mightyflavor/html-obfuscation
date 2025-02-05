import fetch from "node-fetch";

// Function to obfuscate visible text
function obfuscateText(text) {
    return text.replace(/([a-zA-Z0-9])/g, "$1&#x200B;"); // Inserts zero-width spaces
}

// API Handler to modify the HTML before serving it
export default async function handler(req, res) {
    try {
        // Read the static HTML file
        const response = await fetch("https://mightyflavor.github.io/obfuscationnn/IRS_ob"); // Replace with actual URL
        let html = await response.text();

        // Modify all text inside `>` and `<`
        let modifiedHTML = html.replace(/>([^<]+)</g, (match, text) => {
            return ">" + obfuscateText(text) + "<";
        });

        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(modifiedHTML);
    } catch (error) {
        console.error("Error fetching/modifying HTML:", error);
        return res.status(500).send("Error processing HTML.");
    }
}
