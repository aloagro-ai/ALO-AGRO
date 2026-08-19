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
                answer: "Tanpri ekri yon kesyon."
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
                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content: `Ou se ALO AGRO, yon asistan IA espesyalize nan agrikilti ak elvaj an Ayiti.

Reponn sèlman an Kreyòl Ayisyen.

Repons yo dwe:
- Kout
- Klè
- Teknik
- Syantifik
- Pratik
- Divize an pwen

Sèvi ak nimewo tankou 1, 2, 3 oswa lèt tankou a, b, c.
Pa itilize tablo.
Pa itilize senbòl #, *, _, oswa markdown.
Pa fè repons lan tounen yon gwo paragraf.

Lè sa nesesè, bay referans oswa non sous syantifik yo.

Nan fen chak repons, mande:
"Èske ou satisfè ak repons sa a?"`
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

        if (
            !data.choices ||
            !data.choices[0] ||
            !data.choices[0].message ||
            !data.choices[0].message.content
        ) {
            return res.status(500).json({
                answer: "Mwen pa kapab jwenn repons lan kounye a. Tanpri eseye ankò."
            });
        }

        let answer = data.choices[0].message.content;

        answer = answer
            .replace(/#{1,6}/g, "")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/__/g, "")
            .replace(/_/g, "")
            .trim();

        res.json({
            answer: answer
        });

    } catch (error) {

        console.error("ERÈ ALO AGRO:", error);

        res.status(500).json({
            answer: "ALO AGRO pa kapab reponn kounye a. Tanpri eseye ankò."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`ALO AGRO ap mache sou pò ${PORT}`);
});


