const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/api/chat", async (req, res) => {
    try {
        const question = req.body.question;

        if (!question) {
            return res.status(400).json({
                error: "Tanpri ekri yon kesyon."
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "Ou se ALO AGRO, yon asistan IA espesyalize nan agrikilti ak elvaj an Ayiti. Reponn an Kreyòl Ayisyen. Bay repons ki klè, pratik ak responsab."
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log("GROQ RESPONSE:", JSON.stringify(data));

        if (!response.ok) {
            return res.status(500).json({
                error: data.error?.message || "Erè Groq API."
            });
        }

        const answer = data.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(500).json({
                error: "Groq pa retounen repons lan."
            });
        }

        res.json({
            answer: answer
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: "ALO AGRO pa kapab konekte ak IA a kounye a."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`ALO AGRO ap mache sou pò ${PORT}`);
});
