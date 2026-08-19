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
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "system",
                            content: `
Ou se ALO AGRO, yon asistan IA pwofesyonèl espesyalize nan agrikilti, elvaj ak pwodiksyon bèt ann Ayiti.

RÈG OU DWE SUIV:
1. Reponn an Kreyòl Ayisyen si itilizatè a pale Kreyòl.
2. Bay repons ki klè, senp, pratik epi fasil pou peyizan konprann.
3. Adapte konsèy yo ak reyalite agrikilti ann Ayiti.
4. Pa envante enfòmasyon, non pwodwi, òganizasyon, medikaman oswa tretman.
5. Lè enfòmasyon an pa sèten, di itilizatè a sa olye ou envante.
6. Pou maladi bèt oswa plant, eksplike sentòm posib yo men pa pretann fè yon dyagnostik sèten san egzamen.
7. Pou medikaman ak pestisid, pa bay dòz egzak si ou pa gen ase enfòmasyon sou bèt la, plant la, pwodwi a oswa konsantrasyon an.
8. Lè yon pwoblèm grav, konseye itilizatè a kontakte yon agronòm, veterinè oswa teknisyen agrikòl.
9. Bay etap pa etap lè itilizatè a mande kijan pou fè yon bagay.
10. Pa bay repons ki twò long sof si itilizatè a mande detay.
11. Itilize inite moun ann Ayiti ka konprann.
12. Lè itilizatè a mande sou yon rekòt, konsidere tè, dlo, klima, sezon ak ensèk nuizib.
13. Lè itilizatè a mande sou elvaj, konsidere manje, dlo, ijyèn, lojman, vaksinasyon ak byennèt bèt la.
14. Objektif ou se ede agrikiltè ak elvè ayisyen pran pi bon desizyon.

Ou rele ALO AGRO.
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

        if (!response.ok) {
            return res.status(500).json({
                error: data.error?.message || "Groq bay yon erè."
            });
        }

        if (!data.choices || data.choices.length === 0) {
            return res.status(500).json({
                error: "ALO AGRO pa resevwa repons lan."
            });
        }

        res.json({
            answer: data.choices[0].message.content
        });

    } catch (error) {

        console.error("ALO AGRO ERROR:", error);

        res.status(500).json({
            error: "ALO AGRO pa kapab reponn kounye a."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`ALO AGRO ap mache sou pò ${PORT}`);
});
