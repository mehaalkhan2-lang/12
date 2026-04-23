import { GoogleGenAI, Type } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (!key) {
      console.warn("X LUXE: GEMINI_API_KEY or VITE_GEMINI_API_KEY is missing from environment.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey: key });
  }
  return genAI;
}

export const getAIConciergeResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], retryCount = 0): Promise<any> => {
  try {
    const ai = getAI();
    const key = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!ai || !key || key.length < 10) {
      return { 
        text: "The clinical brain is offline. Mehaal, please ensure 'VITE_GEMINI_API_KEY' is set in Vercel settings and then Redeploy your site." 
      };
    }

    const formattedHistory = history[0].role === 'model' ? history.slice(1) : history;
    if (formattedHistory.length === 0) {
      return { text: "Greetings. I am the X LUXE Clinical Concierge. How may I refine your ritual today?" };
    }

    const modelToUse = "gemini-3-flash-preview"; // Switching to gemini-3 to resolve 404 version issues

    const response = await ai.models.generateContent({
      model: modelToUse,
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
        }],
        temperature: 0.7,
      },
    });

    return {
      text: response.text || "Connection to the collective lost. Please refresh your perception.",
      functionCalls: response.functionCalls
    };
  } catch (error: any) {
    console.error("AI Concierge Sync Error:", error);
    
    // Auto-retry once for rate limits
    if (retryCount < 1 && error?.message?.includes('429')) {
      await new Promise(res => setTimeout(res, 2000));
      return getAIConciergeResponse(history, retryCount + 1);
    }
    
    if (error?.message?.includes('404')) {
      return { text: "The Clinical Concierge is currently recalibrating its model. Please wait a few moments." };
    }
    
    return { text: "The clinical brain is currently busy with other elite patrons. Please consult the WhatsApp Concierge while we recalibrate." };
  }
};
