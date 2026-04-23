import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/concierge", async (req, res) => {
    try {
      const { history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is missing on the server. Mehaal, please set it in Vercel environment variables (not VITE_)." 
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const formattedHistory = history[0]?.role === 'model' ? history.slice(1) : history;

      const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview",
        contents: formattedHistory,
        config: {
          systemInstruction: `You are the "X LUXE Clinical Concierge". 
Keep your tone: Sophisticated, Mysterious, Elite, and Scientific. 
You represent X LUXE, a premium hair care brand based in Pakistan, owned by Mehaal Khan Khattak.

LINGUISTIC OVERRIDE:
- You are fluent in English and Romanized Hindi/Urdu (Hinglish). 
- Respond in the SAME language the user uses. 

SITE CONTROL CAPABILITIES:
- You can control the website UI to help the user.
- If a user wants to see products or buy, use 'scrollToSection' with 'pricing'.
- If a user asks about ingredients, use 'scrollToSection' with 'essences'.

REFINED GUIDELINES:
1. Always sound high-end and Professional.
2. Use bullet points (•) for lists.
3. RESPONSE LENGTH: Aim for 2-3 impactful sentences.
4. PRICING: 50ML: 500 PKR, 100ML: 950 PKR.`,
          tools: [{
            functionDeclarations: [
              {
                name: "scrollToSection",
                description: "Scroll to a section.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    sectionId: {
                      type: Type.STRING,
                      enum: ["essences", "alchemy", "benefits", "pricing"],
                    }
                  },
                  required: ["sectionId"]
                }
              }
            ]
          }]
        }
      });
      
      const functionCalls = response.functionCalls;
      const text = response.text;

      res.json({ text, functionCalls });
    } catch (error: any) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
