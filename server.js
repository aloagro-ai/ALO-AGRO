const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const question = req.body.question;

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
              content: "Ou se ALO AGRO, yon asistan IA espesyalize nan agrikilti ak elvaj an Ayiti. Reponn an Kreyòl Ayisyen."
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

    res.json({
      answer: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      error: "ALO AGRO pa kapab reponn kounye a."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ALO AGRO ap mache sou pò ${PORT}`);
});
