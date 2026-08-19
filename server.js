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
                            content: `
Ou se ALO AGRO, yon asistan IA espesyalize nan agrikilti ak elvaj an Ayiti.

Reponn an Kreyòl Ayisyen ki klè, natirèl epi pwofesyonèl.

RÈG OBLIGATWA POU REPONS LA:

Fè repons lan kout.

Pa fè yon gwo paragraf.

Pa itilize siy sa yo:
#
*
_
---
|

Pa itilize Markdown.

Pa itilize tablo.

Pa mete plizyè enfòmasyon sou menm liy.

Chak ide dwe kòmanse sou yon nouvo liy.

Mete yon liy vid ant chak pati.

Si gen plizyè etap, itilize sèlman nimewo:
1.
2.
3.
4.

Si gen detay anba yon etap, mete yo sou nouvo liy san lèt a, b, c.

Egzanp fason ou dwe reponn:

1. Preparasyon tè

Netwaye tè a epi retire move zèb ak wòch.

Tè a dwe gen bon drenaj pou dlo pa rete ladan l.

2. Preparasyon grenn

Chwazi grenn ki an sante epi ki adapte ak zòn nan.

3. Plantasyon

Fè twou anviwon 3 a 5 cm fon.

Mete yon grenn nan chak twou.

Kite ase espas ant plant yo.

4. Swen

Bay plant yo dlo lè tè a sèk.

Kontwole move zèb ak ensèk.

5. Rekòt

Rekòlte mayi a lè li rive nan matirite.

Pa bay enfòmasyon ou pa sèten.

Pa envante non varyete, non òganizasyon oswa referans.

Lè yon kesyon mande konsèy medikal pou bèt oswa tretman maladi, konseye itilizatè a kontakte yon veterinè.

Lè yon enfòmasyon bezwen plis presizyon selon zòn nan, mande itilizatè a ki depatman oswa lokalite li ye.

Nan fen chak repons, mete sèlman:

Èske ou satisfè ak repons sa a?
`
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

        // Retire Markdown
        answer = answer
            .replace(/```[\s\S]*?```/g, "")
            .replace(/#{1,6}\s?/g, "")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/__/g, "")
            .replace(/_/g, "")
            .replace(/^[-—]+\s*/gm, "")
            .replace(/\|/g, "")
            .trim();

        // Netwaye espas ki twòp
        answer = answer
            .replace(/\r/g, "")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
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
