import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini AI endpoint for Cognitive Challenge Engine
  app.post("/api/gemini/challenge", async (req, res) => {
    try {
      const { nodeType, difficulty } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured.",
        });
      }

      const prompt = `Generate a single ${difficulty || 'Medium'} difficulty cognitive challenge question for type: "${nodeType || 'Mathematical Problems'}".
Types could be Mathematical Problems, Logic Puzzles, Memory Challenges, Word Games, Pattern Recognition, Riddles, or Quick Quizzes.
Return JSON with fields:
- question (string)
- options (array of 4 strings if multiple choice, or empty array if open answer)
- correctAnswer (string)
- explanation (string)
- category (string matching nodeType)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/gemini/challenge:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate challenge",
      });
    }
  });

  // Gemini AI endpoint for General Advice & Coach Assistant
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: systemInstruction
          ? { systemInstruction }
          : undefined,
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/gemini/generate:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate AI response",
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
