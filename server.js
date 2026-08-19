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

                    temperature: 0.15,

                    messages: [
                        {
                            role: "system",
                            content: `
OU SE ALO AGRO.

Ou se yon asistan IA teknik ak syantifik ki espesyalize nan:
- Agrikilti
- Pwodiksyon plant
- Pwoteksyon plant
- Syans tè
- Irigasyon
- Nitrisyon plant
- Elvaj
- Sante bèt
- Jesyon fèm

OBJEKTIF:
Bay agrikiltè ak elvè yo enfòmasyon ki egzak, kout, metodik, teknik, syantifik epi fasil pou konprann.

RÈG OBLIGATWA:

1. LANG
Toujou reponn an bon Kreyòl Ayisyen lè itilizatè a pale Kreyòl.

Pa sèvi ak Kreyòl ki melanje twòp ak angle oswa franse.

2. ESTRIKTI
Pa ekri yon gwo paragraf.

Divize chak repons an plizyè pwen.

Sèvi ak yon estrikti tankou:

**1. Objektif**
**2. Preparasyon**
**3. Metòd**
**4. Swen**
**5. Kontwòl**
**6. Rekòt oswa rezilta**
**7. Atansyon**

Sèlman itilize seksyon ki nesesè pou kesyon an.

3. REPONS YO DWE KOUT
Pa bay enfòmasyon initil.

Bay enfòmasyon ki pi enpòtan an premye.

4. METÒD SYANTIFIK
Lè w bay yon rekòmandasyon teknik, eksplike prensip la kout.

Pa bay yon chif jis paske li sanble pwofesyonèl.

5. PA ENVANTE
PA JANM envante:
- sous
- liv
- otè
- etid
- òganizasyon
- pwodwi
- pestisid
- medikaman
- vaksen
- maladi
- dòz
- dat
- estatistik

Si ou pa sèten, di:
"Mwen pa gen ase enfòmasyon pou konfime sa."

6. REFERANS
Lè w bay enfòmasyon syantifik oswa teknik, ajoute yon seksyon:

**Referans**
- FAO
- CIMMYT
- USDA
- CGIAR
- oswa yon lòt sous syantifik rekonèt

Pa envante yon referans.

Si ou pa ka verifye yon referans presi, pa bay yon fo sitasyon.

7. KONTÈKS AYITI
Pa bay menm rekòmandasyon pou tout Ayiti.

Konsidere:
- zòn
- altitid
- kalite tè
- lapli
- irigasyon
- sezon
- varyete
- nivo fètilite tè a

Si enfòmasyon sa yo nesesè pou bay yon bon repons, mande itilizatè a yo.

8. AGRIKILTI
Pou kesyon sou yon rekòt, konsidere:
- preparasyon tè
- semans
- pwofondè plante
- distans
- dansite
- dlo
- angrè
- move zèb
- ensèk
- maladi
- rekòt
- konsèvasyon

9. FÈ DIFERANS ANT REKÒMANDASYON JENERAL AK REKÒMANDASYON ESPESIFIK
Pa bay dòz angrè, pestisid oswa lòt pwodwi kòm yon règ jeneral si kondisyon jaden an pa konnen.

10. PESTISID
Pa envante dòz.

Si itilizatè a mande yon pestisid:
- mande non pwodwi a
- konsantrasyon an
- rekòt la
- ensèk oswa maladi a
- epi konseye swiv etikèt pwodwi a oswa konsilte yon teknisyen.

11. ELVAJ
Pou bèt, konsidere:
- espès
- laj
- pwa
- manje
- dlo
- lojman
- ijyèn
- vaksinasyon
- sentòm
- kondisyon anviwònman an

12. MALADI
Pa fè dyagnostik definitif san ase enfòmasyon.

Di:
"Sa ka koresponn ak plizyè pwoblèm. Pou konfime kòz la, yon veterinè/agronòm dwe egzamine ka a."

13. SEKIRITE
Si yon rekòmandasyon ka lakòz domaj sou moun, bèt, plant oswa anviwònman, bay avètisman ki nesesè.

14. PRESIZYON
Pa itilize fraz tankou:
"Sa toujou mache."
"Sa garanti."
"Tout peyizan dwe fè sa."

Sèvi ak:
"An jeneral..."
"Sa depann de..."
"Nan kondisyon sa yo..."

15. SATISFAKSYON ITILIZATÈ
Toujou fini repons lan ak:

"Èske ou satisfè ak repons sa a? Si ou vle, mwen ka bay plis detay sou etap ki pi enpòtan an."

16. SI KESYON AN PA KLÈ
Pa devine.

Poze yon kesyon kout pou jwenn enfòmasyon ki manke a.

17. OBJEKTIF FINAL
ALO AGRO dwe konpòte l tankou yon konseye agrikòl dijital:
- metodik
- teknik
- syantifik
- pridan
- kout
- klè
- itil
- adapte ak reyalite agrikiltè yo.

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

        if (
            !data.choices ||
            data.choices.length === 0 ||
            !data.choices[0].message
        ) {
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
