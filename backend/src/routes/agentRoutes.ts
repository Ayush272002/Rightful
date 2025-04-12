/**
 * @fileoverview Routes for handling agent interactions, including chat safety checks,
 * platform guidance, and document classification. Implements a layered approach to
 * ensure safe and relevant responses.
 */

import { Router, RequestHandler } from "express";
import { generateTextWithContext } from "../utils/llmUtils";
import * as AgentInstructions from "../utils/agentInstructions";

const router = Router();

interface ChatRequest {
  message: string;
  context?: string;
}

interface DocumentRequest {
  document_text: string;
  classification_type?: string;
}

/**
 * Handles chat requests with safety validation and platform guidance
 * @param req Express request object containing chat message and context
 * @param res Express response object
 */
const handleChat: RequestHandler<{}, any, ChatRequest> = async (req, res) => {
  try {
    const { message, context } = req.body;

    // Initial safety check
    // TODO: Add rate limiting
    const safetyCheck = await generateTextWithContext(
      JSON.stringify({ user_input: message, latest_context_summary: context }),
      AgentInstructions.SAFETY_AGENT_INSTRUCTIONS
    );

    if (!safetyCheck) {
      res.status(500).json({ error: "Failed to perform safety check" });
      return;
    }

    const safetyResult = JSON.parse(safetyCheck);

    // Return early if content is flagged as unsafe
    if (safetyResult.status !== "SAFE") {
      res.json({
        status: safetyResult.status,
        message: safetyResult.explanation,
      });
      return;
    }

    // Process safe messages with guide agent
    const response = await generateTextWithContext(
      JSON.stringify({ user_input: message, latest_context_summary: context }),
      AgentInstructions.PLATFORM_GUIDE_AGENT_INSTRUCTIONS
    );

    if (!response) {
      res.status(500).json({ error: "Failed to generate response" });
      return;
    }

    const guideResponse = JSON.parse(response);
    res.json({
      status: "SAFE",
      message: guideResponse.response,
    });
  } catch (error) {
    console.error("Chat processing error:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
};

/**
 * Handles document classification requests
 * @param req Express request object containing document text and classification type
 * @param res Express response object
 */
const handleDocumentClassification: RequestHandler<
  {},
  any,
  DocumentRequest
> = async (req, res) => {
  try {
    const { document_text, classification_type } = req.body;

    // Send document for classification
    const response = await generateTextWithContext(
      JSON.stringify({ document_text, classification_type }),
      AgentInstructions.DOCUMENT_CLASSIFIER_INSTRUCTIONS
    );

    if (!response) {
      res.status(500).json({ error: "Failed to classify document" });
      return;
    }

    const classification = JSON.parse(response);
    res.json(classification);
  } catch (error) {
    console.error("Document classification error:", error);
    res.status(500).json({ error: "Failed to classify document" });
  }
};

router.post("/chat", handleChat);
router.post("/classify", handleDocumentClassification);

export default router;
