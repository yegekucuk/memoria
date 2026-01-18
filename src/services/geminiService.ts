import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  // In a real app, we'd handle the missing key gracefully or via UI prompt. 
  // Here we assume it might be present or we fail gracefully.
  return new GoogleGenAI({ apiKey });
};

export const generateProductivityInsight = async (
  sessionHistory: string,
  userQuery: string
): Promise<string> => {
  try {
    const ai = getClient();
    // Using flash-preview for speed and efficiency for this help desk task
    const model = 'gemini-3-flash-preview'; 
    
    const prompt = `
      You are an AI productivity coach for an app called "howmanyhours?".
      
      User's Session History Summary:
      ${sessionHistory}

      User Query: "${userQuery}"

      Provide a helpful, encouraging, and concise response (max 100 words). 
      If the user asks for analysis, use the provided history.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "I couldn't generate an insight right now. Keep focusing!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the AI brain right now. Please try again later.";
  }
};
