
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askBusinessAssistant(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are Gabriel's "Strategic Support Assistant". Your goal is to help users understand our specialized professional services.
        Our core service pillars are:
        1. Logistics Management (supply chain, distribution, timely delivery).
        2. IT Support Level I & II (troubleshooting, infrastructure, network security).
        3. C-Level Admin Support (executive assistance, scheduling, correspondence).
        4. Customer Relations & Experience (support operations, satisfaction scores, retention).
        
        Always be professional, highly intelligent, and helpful. Focus on how Gabriel's dedicated teams become an extension of our clients' organizations. 
        If a user asks about pricing, mention our Starter ($3,500/mo) and Professional ($5,990/mo) plans or custom Enterprise options.
        Always encourage users to "Schedule a Consultation" on the home page for deep-dive discussions.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently optimizing my systems. Please reach out via our contact form for immediate assistance!";
  }
}
