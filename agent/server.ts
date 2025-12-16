import "dotenv/config";
import express from "express";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { options } from "./options.js";
import { formatMessage } from "./util.js";

const app = express();
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 4000;

// curl -N -X POST http://localhost:4000/chat -H "Content-Type: application/json" -d '{"prompt":"How is Bill the cat doing?"}'
// curl -N -X POST http://localhost:4000/chat -H "Content-Type: application/json" -d '{"prompt":"I want to listen to some moody music"}'

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing or invalid 'prompt' in request body" });

    return;
  }

  // Set headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    for await (const message of query({prompt, options})) {
      const formatted = formatMessage(message);

      if (formatted) {
        res.write(`${JSON.stringify({ type: message.type, content: formatted })}\n`);
      }
    }

    res.write(`${JSON.stringify({ type: "done" })}\n`);

    res.end();
  } catch (error) {
    res.write(`${JSON.stringify({ type: "error", content: error })}\n`);

    res.end();
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Agent server listening on http://localhost:${SERVER_PORT}`);
});
