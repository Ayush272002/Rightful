import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateText(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text;
}

export async function generateTextWithContext(prompt: string, context: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${prompt}\n\n${context}`,
  });
  return response.text;
}
