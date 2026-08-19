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

function cleanAnswer(text) {

    if (!text) {
        return "Mwen pa jwenn yon repons nan men sistèm IA a.";
    }

    let answer = text;

    // Retire Markdown
    answer = answer.replace(/```[\s\S]*?```/g, "");
    answer = answer.replace(/#{1,6}\s*/g, "");
    answer = answer.replace(/\*\*/g, "");
    answer = answer.replace(/\*/g, "");
    answer = answer.replace(/__/g, "");
    answer = answer.replace(/_/g, "");

    // Retire liy ki kòmanse ak tire
    answer = answer.replace(/^\s*[-–—]\s*/gm, "");

    // Retire kèk siy ki pa nesesè
    answer = answer.replace(/`/g, "");
    answer = answer.replace(/>/g, "");

    // Netwaye espas
    answer = answer.replace(/[ \t]+/g, " ");

    // Pa kite twòp liy vid
    answer = answer.replace(/\n{3,}/g, "\n\n");

    return answer.trim();
}


// ===============================
// API ALO AGRO
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const question = req.body.question;

        if (!question || !question.trim()) {

            return res.status(400).json({
                error: "Tanpri ekri yon kesyon."
            });

        }


        // ===============================
        // PROMPT ALO AGRO
        // ===============================

        const systemPrompt = `
Ou se ALO AGRO.

Ou se yon asistan entèlijan espesyalize nan agrikilti, elvaj ak sante plant ak bèt nan kontèks Ayiti.

OBJEKTIF:
Bay repons ki kout, teknik, syantifik, metodik epi fasil pou yon agrikiltè oswa etidyan konprann.

LANG:
Toujou reponn an Kreyòl Ayisyen ki byen ekri, sof si itilizatè a mande yon lòt lang.

ESTRIKTI OBLIGATWA:
Repons lan dwe divize an plizyè pwen.

Sèvi ak fòma sa a:

1. Tit premye pati
a) Premye enfòmasyon.
b) Dezyèm enfòmasyon.
c) Twazyèm enfòmasyon.

2. Tit dezyèm pati
a) Premye enfòmasyon.
b) Dezyèm enfòmasyon.
c) Twazyèm enfòmasyon.

3. Tit twazyèm pati
a) Enfòmasyon.
b) Enfòmasyon.

Si gen yon etap ki bezwen fèt, itilize nimewo 1, 2, 3, 4.

RÈG ENPÒTAN:
Pa itilize Markdown.
Pa itilize #.
Pa itilize *.
Pa itilize _.
Pa itilize tire "-" pou fè lis.
Pa fè gwo paragraf ki mele.
Pa fè tablo.
Pa mete emoji nan mitan repons lan.
Pa repete menm enfòmasyon plizyè fwa.

Chak pati dwe klè epi separe.

Pou kesyon agrikòl, bay mezi, kantite, distans, tan, kondisyon tè, dlo oswa lòt detay teknik sèlman lè yo apwopriye.

Pou kestyon sou maladi plant oswa bèt, pa bay yon dyagnostik sèten san ase enfòmasyon. Endike lè yon agronòm, veterinè oswa teknisyen dwe verifye ka a.

REFERANS:
Nan fen repons lan, mete yon seksyon:

REFERANS
a) FAO
b) Ministè Agrikilti oswa sèvis agrikòl ofisyèl, lè enfòmasyon an disponib.
c) Lòt sous syantifik serye ki aplikab.

Pa envante non yon etid, liv oswa sous.

FIN REPONS:
Toujou fini ak fraz sa a:

Èske ou satisfè ak repons sa a?

PA BAY YON ENTWODIKSYON LONG.
ALE DIRÈKTEMAN NAN REPONS LAN.
`;


        // ===============================
        // VOYE KESYON BAY GROQ
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

                    model: "llama-3.3-70b-versatile",

                    messages: [

                        {
                            role: "system",
                            content: systemPrompt
                        },

                        {
                            role: "user",
                            content: question.trim()
                        }

                    ],

                    temperature: 0.2,

                    max_tokens: 1200

                })
            }
        );


        // ===============================
        // VERIFYE REPONS GROQ
        // ===============================

        const data = await response.json();

        console.log("Repons Groq:", data);


        if (!response.ok) {

            return res.status(500).json({

                error:
                    data?.error?.message ||
                    "Groq pa kapab bay repons lan kounye a."

            });

        }


        if (
            !data ||
            !data.choices ||
            !data.choices[0] ||
            !data.choices[0].message
        ) {

            return res.status(500).json({

                error: "Sistèm IA a pa voye yon repons ki valab."

            });

        }


        // ===============================
        // PRAN REPONS IA A
        // ===============================

        let answer = data.choices[0].message.content;


        // Netwaye Markdown
        answer = cleanAnswer(answer);


        // ===============================
        // VOYE REPONS LAN BAY SIT LA
        // ===============================

        res.json({

            answer: answer

        });


    } catch (error) {

        console.error("ERÈ ALO AGRO:", error);

        res.status(500).json({

            error:
                "ALO AGRO pa kapab kontakte sistèm IA a kounye a."

        });

    }

});


// ===============================
// PORT RENDER
// ===============================

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

    console.log(
        `ALO AGRO ap mache sou pò ${PORT}`
    );

});
