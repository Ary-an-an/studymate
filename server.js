const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.API_KEY
});

// Mode instructions
const modeInstructions = {
  short: `
- Keep answers short and direct.
- Use bullet points where possible.
- Stay under 5–7 lines unless the user asks for more.
  `,
  exam: `
- Answer like an exam response.
- Use numbered points.
- Focus on key terms that would earn marks.
- Avoid casual tone.
  `,
  explain10: `
- Explain as if to a 10-year-old.
- Use simple language and analogies.
- Avoid jargon.
  `,
  summary: `
- Summarise the content.
- Use concise bullet points.
- Focus on main ideas only.
  `,
  flashcards: `
- Generate Q&A flashcards.
- Each line: "Q: ...  A: ..."
- Keep questions short and focused.
  `,
  quiz: `
- Ask the user questions based on the material.
- Wait for their answer before revealing the correct one.
- Use numbered questions.
  `
};

app.get("/", (req, res) => {
  res.json({ message: "StudyMate Node backend is running" });
});

// IMPORTANT: route is now /chat (not /api/chat)
app.post("/chat", async (req, res) => {
  const { message, context, mode } = req.body;

  const selectedMode = modeInstructions[mode] ? mode : "short";
  const modeText = modeInstructions[selectedMode];

  const prompt = `
You are StudyMate, a smart, friendly, and concise study assistant.

### Global Rules:
- Be helpful and clear.
- Never repeat the question.
- Avoid unnecessary filler.
- If the question is unclear, ask briefly for clarification.

### Mode:
${selectedMode.toUpperCase()}
${modeText}

### Study Material:
${context || "No study material uploaded yet."}

### User Question:
${message}

### Your Response:
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error talking to the AI backend." });
  }
});

app.listen(PORT, () => {
  console.log(`Node backend running on port ${PORT}`);
});