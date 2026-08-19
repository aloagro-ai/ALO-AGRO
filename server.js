const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// ALO AGRO - PAGE PRINCIPALE
// ===============================
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


// ===============================
// NETWAYAJ REPONS IA
// ===============================
function cleanResponse(text) {

    if (!text) {
        return "Mwen pa jwenn yon repons pou kesyon sa a.";
    }

    let answer = text;

    // Retire Markdown ki pa nesesè
    answer = answer.replace(/```[\s\S]*?```/g, "");
    answer = answer.replace(/^#{1,6}\s*/gm, "");
    answer = answer.replace(/\*\*/g, "");
    answer = answer.replace(/\*/g, "");
    answer = answer.replace(/__/g, "");
    answer = answer.replace(/_/g, " ");

    // Retire tablo Markdown
    answer = answer.replace(/^\|.*\|$/gm, "");
    answer = answer.replace(/^\s*\|?[\s:-]+\|[\s|:-]*$/gm, "");

    // Retire espas ki repete
    answer = answer.replace(/[ \t]+/g, " ");

    // Pa kite plis pase 2 liy vid
    answer = answer.replace(/\n{3,}/g, "\n\n");

    // Netwaye kòmansman/fen
    answer = answer.trim();

    return answer;
}


// ===============================
// API ALO AGRO
// ===============================
app.post("/api/chat", async (req, res) => {

    try {

        const question = req.body.question;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                error: "Tanpri ekri yon kesyon."
            });
        }


        // ===============================
        // REQUETE GROQ
        // ===============================

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

                    temperature: 0.2,

                    max_tokens: 900,

                    messages: [

                        {
                            role: "system",

                            content: `
Ou se ALO AGRO, yon asistan entèlijan espesyalize nan agrikilti ak elvaj ann Ayiti.

Objektif ou se bay repons ki:
- teknik
- syantifik
- egzak
- pratik
- kout
- fasil pou yon peyizan konprann

REGLEMAN FÒMA OBLIGATWA:

1. Pa janm itilize Markdown.

2. Pa itilize:
#
*
_
***
**
tablo
tik Markdown
lis ak tire

3. Pa itilize gwo paragraf ki mele.

4. Divize repons lan an ti seksyon nimewote:
1.
2.
3.
4.
5.

5. Lè yon seksyon bezwen plis detay, itilize:
a)
b)
c)
d)

6. Chak pwen dwe kout e dirèk.

7. Mete non seksyon an apre nimewo a.

Egzanp:

1. Preparasyon tè
a) Netwaye tè a epi retire move zèb.
b) Verifye drenaj tè a.
c) Si posib, fè yon analiz tè.

2. Preparasyon grenn
a) Chwazi grenn ki an sante.
b) Chwazi yon varyete ki adapte ak zòn nan.

8. Pa repete menm enfòmasyon an.

9. Pa envante non varyete, kantite angrè, medikaman oswa sous syantifik.

10. Lè ou bay yon kantite oswa yon dòz, presize inite a.

11. Pou kesyon agrikilti, itilize enfòmasyon syantifik jeneral ki aksepte nan agronomi.

12. Lè li nesesè, site sous serye tankou FAO, CIMMYT, IITA oswa lòt enstitisyon agrikòl rekonèt. Pa envante referans.

13. Repons lan dwe an Kreyòl Ayisyen si moun nan pale Kreyòl.

14. Pa kòmanse repons lan ak "ALO AGRO:" paske sistèm lan deja mete non an.

15. Pa mete "Bonjou" nan chak repons.

16. Nan fen repons lan, mete sèlman:
Èske ou satisfè ak repons sa a?

17. Pa ajoute okenn lòt fraz apre kesyon sa a.

18. Pa fè repons lan twò long. Bay sèlman enfòmasyon ki nesesè pou reponn kesyon an.

`
                        },

                        {
                            role: "user",
                            content: question.trim()
                        }

                    ]

                })
            }
        );


        // ===============================
        // LI REPONS GROQ
        // ===============================

        const data = await response.json();


        console.log("GROQ RESPONSE:", JSON.stringify(data));


        // ===============================
        // VERIFYE ERÈ GROQ
        // ===============================

        if (!response.ok) {

            console.error("GROQ ERROR:", data);

            return res.status(500).json({
                error: "ALO AGRO pa kapab jwenn repons lan kounye a."
            });
        }


        if (
            !data.choices ||
            !data.choices[0] ||
            !data.choices[0].message ||
            !data.choices[0].message.content
        ) {

            console.error("Repons Groq pa gen kontni:", data);

            return res.status(500).json({
                error: "ALO AGRO pa jwenn repons IA a."
            });
        }


        // ===============================
        // NETWAYE REPONS LAN
        // ===============================

        const answer = cleanResponse(
            data.choices[0].message.content
        );


        // ===============================
        // RETOUNEN REPONS LAN
        // ===============================

        res.json({
            answer: answer
        });


    } catch (error) {

        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: "ALO AGRO pa kapab reponn kounye a."
        });

    }

});


// ===============================
// PORT RENDER
// ===============================

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`ALO AGRO ap mache sou pò ${PORT}`);
});
