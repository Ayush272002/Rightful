/**
 * @fileoverview Routes for handling agent interactions, including chat safety checks,
 * platform guidance, and document classification. Implements a layered approach to
 * ensure safe and relevant responses.
 */

import express, {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { generateText, generateTextWithContext } from "../utils/llmUtils";
import {
  SAFETY_AGENT_INSTRUCTIONS,
  PLATFORM_GUIDE_AGENT_INSTRUCTIONS,
  DOCUMENT_CLASSIFIER_INSTRUCTIONS,
  DOCUMENT_DESCRIPTION_GENERATOR_INSTRUCTIONS,
} from "../utils/agentInstructions";

const router = Router();

interface ChatRequest {
  message: string;
  context?: string;
}

interface DocumentRequest {
  text: string;
  classification_type?: string;
}

// Helper function to parse JSON response
const parseJsonResponse = (response: string): any => {
  try {
    // Remove any potential text before or after the JSON object
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    throw new Error("Invalid JSON response from LLM");
  }
};

// Chat endpoint
router.post(
  "/chat",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, context } = req.body as ChatRequest;

      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      // First, check if the message is safe using the Safety Agent
      const safetyCheck = await generateTextWithContext(
        SAFETY_AGENT_INSTRUCTIONS,
        JSON.stringify({
          user_input: message,
          latest_context_summary: context || "",
        })
      );

      if (!safetyCheck) {
        res.status(500).json({ error: "Failed to perform safety check" });
        return;
      }

      const safetyResult = parseJsonResponse(safetyCheck);

      if (safetyResult.status !== "SAFE") {
        res.status(400).json({
          status: safetyResult.status,
          message: safetyResult.explanation,
          error: "Message rejected",
        });
        return;
      }

      // If safe, generate response using the Platform Guide Agent
      const response = await generateTextWithContext(
        PLATFORM_GUIDE_AGENT_INSTRUCTIONS,
        JSON.stringify({
          user_input: message,
          latest_context_summary: context || "",
        })
      );

      if (!response) {
        res.status(500).json({ error: "Failed to generate response" });
        return;
      }

      const parsedResponse = parseJsonResponse(response);
      res.json(parsedResponse);
    } catch (error) {
      next(error);
    }
  }
);

// Document classification endpoint
router.post(
  "/classify-document",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { text, classification_type } = req.body as DocumentRequest;

      if (!text) {
        res.status(400).json({ error: "Document text is required" });
        return;
      }

      const response = await generateTextWithContext(
        DOCUMENT_CLASSIFIER_INSTRUCTIONS,
        JSON.stringify({
          document_text: text,
          classification_type: classification_type || "",
        })
      );

      if (!response) {
        res.status(500).json({ error: "Failed to classify document" });
        return;
      }

      const parsedResponse = parseJsonResponse(response);
      res.json(parsedResponse);
    } catch (error) {
      next(error);
    }
  }
);

// Document description generator endpoint
router.post(
  "/generate-document-description",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { text } = req.body as DocumentRequest;

      if (!text) {
        res.status(400).json({ error: "Document text is required" });
        return;
      }

      const response = await generateTextWithContext(
        DOCUMENT_DESCRIPTION_GENERATOR_INSTRUCTIONS,
        JSON.stringify({
          document_text: text,
        })
      );

      if (!response) {
        res
          .status(500)
          .json({ error: "Failed to generate document description" });
        return;
      }

      const parsedResponse = parseJsonResponse(response);
      res.json(parsedResponse);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
