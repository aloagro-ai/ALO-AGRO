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
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: "Ou se ALO AGRO, yon asistan IA espesyalize nan agrikilti ak elvaj an Ayiti. Reponn an Kreyòl Ayisyen. Bay repons klè, pratik ak itil."
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

        console.log("GROQ:", JSON.stringify(data));

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "Groq bay yon erè."
            });
        }

        if (!data.choices || !data.choices.length) {
            return res.status(500).json({
                error: "Groq pa voye okenn repons."
            });
        }

        res.json({
            answer: data.choices[0].message.content
        });

    } catch (error) {
        console.error("ERÈ:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`ALO AGRO ap mache sou pò ${PORT}`);
});
