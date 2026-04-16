import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/gemini",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
      });
    }
    
    try {
        const body = await req.json() as { prompt: string, type: "icebreaker"|"trivia"|"wordchain" };
        const { prompt, type } = body;
        
        let systemPrompt = "";
        if (type === "icebreaker") {
            systemPrompt = "Suggest 3 witty ice-breaker one-liners, max 15 words each. Return JSON array of 3 strings only.";
        } else if (type === "trivia") {
            systemPrompt = "Generate 5 trivia questions for a college/tech event audience. Each has 4 options. Return JSON array: [{question, options:[A,B,C,D], correctIndex:0-3, difficulty:'easy'|'medium'}]. Return JSON only, no explanation.";
        } else if (type === "wordchain") {
            systemPrompt = "Check validity of wordchain move. Return JSON only: {valid: true|false, reason: string}";
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }
              ],
            }),
          }
        );

        const data = await response.json();
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        let parsed;
        try {
            const jsonText = aiText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(jsonText);
        } catch {
            return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: aiText }), { status: 500 });
        }

        return new Response(JSON.stringify({ result: parsed }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }),
});

// Convex auth requires to export this router. 
// auth.ts gives a default route but we merge it.
import { auth } from "./auth";
auth.addHttpRoutes(http);

export default http;
