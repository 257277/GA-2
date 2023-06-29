const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");
require('dotenv').config();
const app = express();
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

app.use(express.json());
app.use(cors());
app.post("/convert", async (req, res) => {
    const { code, targetLanguage } = req.body;
    try {

        const runPrompt = async (code, targetLanguage) => {
            const prompt = `Convert the following code from JavaScript to ${targetLanguage}:\n\n${code}`
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 1,
                max_tokens: 1000
            });
            const codegen = response.data.choices[0].text;

            return codegen
        };

        const newcode = await runPrompt(code, targetLanguage); // Wait for the shayari generation to complete
        res.json({ newcode }); // Send the shayari as a JSON response
    }
    catch (err) {
        res.send(err);
    }
});


app.post("/debug", async (req, res) => {
    const { code } = req.body;
    try {
        const runPrompt = async (code) => {
            const prompt = `Debug the following code and also give where the mistakes are:\n\n${code} a`;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 1000,
                temperature: 0.7
            });
            const debugCode = response.data.choices[0].text.trim();
            const correctedCode = extractCorrectedCode(debugCode);
            return { debugCode, correctedCode };
        };
        const { debugCode, correctedCode } = await runPrompt(code);
        res.json({ debugCode, correctedCode });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

function extractCorrectedCode(debugCode) {
    // Implement your logic here to extract the corrected code from the debugCode
    // Adjust the extraction logic based on the format of the debugCode

    // Example logic: Assume the corrected code is enclosed within "/* CORRECTED CODE */" tags
    const regex = /\/\*\sCORRECTED\sCODE\s\*\/(.*?)\/\*\sEND\sCORRECTED\sCODE\s\*\//s;
    const match = debugCode.match(regex);

    if (match) {
        return match[1].trim(); // Extracted corrected code
    }

    return ""; // Default value if no corrected code is found
}
app.post("/quality", async (req, res) => {
    let { code } = req.body;
    try {
        const runPrompt = async (code) => {
            const prompt = `check the quality of foloowing code and rate the quality of code between 0-10 and also give ideas to improve the code:\n\n${code}`;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 1000,
                temperature: 0.7
            });
            const qual = response.data.choices[0].text;

            return qual
        }
        const quality = await runPrompt(code); // Wait for the shayari generation to complete
        res.json({ quality }); // Send the shayari as a JSON response
    }
    catch (err) {
        res.send(err);
    }

})



app.listen(4500, () => {
    console.log("Server listening on port 4500");
});