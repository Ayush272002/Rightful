/**
 * @fileoverview Utility functions for interacting with Google's Gemini LLM API.
 * Handles text generation with and without contextual information.
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_MODEL = "gemini-2.0-flash";
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Generates text from a prompt using the Gemini LLM
 * @param prompt The text prompt to send to the model
 * @returns Generated text or null if generation fails
 */
export async function generateText(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text || null;
  } catch (error) {
    console.error("Error generating text:", error);
    return null;
  }
}

/**
 * Generates text using both a prompt and additional context
 * @param prompt The main text prompt
 * @param context Additional contextual information
 * @returns Generated text or null if generation fails
 */
export async function generateTextWithContext(
  prompt: string,
  context: string
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${prompt}\n\n${context}`,
    });

    const generatedText = response.text || null;

    return generatedText;
  } catch (error) {
    console.error("Error generating text with context:", error);
    return null;
  }
}
