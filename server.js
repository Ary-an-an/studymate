const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Fix for "fetch is not a function" in CommonJS
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

// Increase body size limit so multi-file uploads work
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

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

app.post("/api/chat", async (req, res) => {
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
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false
      })
    });

    const data = await ollamaRes.json();
    res.json({ reply: data.response || "I couldn't generate a response." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error talking to the AI backend." });
  }
});

app.listen(PORT, () => {
  console.log(`Node backend running on http://localhost:${PORT}`);
});
