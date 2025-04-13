/**
 * @fileoverview Main Express server setup for handling PDF uploads and analysis
 */

import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import * as fs from "fs/promises";
import { processDocument } from "./utils/analysisUtils";
import agentRoutes from "./routes/agentRoutes";
import { getDocumentHashes, getDocumentsByHash } from "./blockchain";
import { calculateDocumentSimilarity } from "./utils/vectorUtils";
import { storeDocument } from "./utils/storeDocument";
import { getTotalDeposit, ownerWithdrawFrom } from "./utils/paymentContract";
import { ethers } from "ethers";

const ACCEPTABLE_FILE_TYPES: Record<string, "pdf" | "txt"> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
};

// Core Express configuration
const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/api/agents", agentRoutes);

/**
 * Request type to handle file uploads via Multer
 */
interface MulterRequest extends express.Request {
  file?: Express.Multer.File;
}

app.post("/broadcast", upload.single("file"), async (req, res) => {
  try {
    const {
      title,
      description,
      url,
      publicKey,
      documentHash,
      vector,
      tokenCount,
      lexicalDensity,
      readability,
    } = req.body;

    // Validate required fields
    if (!title || !url || !publicKey || !documentHash) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate metrics are valid numbers
    const tokenCountNum = parseFloat(tokenCount);
    const lexicalDensityNum = parseFloat(lexicalDensity);
    const readabilityNum = parseFloat(readability);

    if (
      isNaN(tokenCountNum) ||
      isNaN(lexicalDensityNum) ||
      isNaN(readabilityNum)
    ) {
      res.status(400).json({ error: "Invalid metrics values" });
      return;
    }

    // Check user's deposit before processing payments
    const GOTO_DEPOSIT = process.env.GOTO_DEPOSIT;
    if (!GOTO_DEPOSIT) {
      throw new Error("GOTO_DEPOSIT environment variable not set");
    }

    const userDeposit = await getTotalDeposit(publicKey);
    if (userDeposit < ethers.parseEther(GOTO_DEPOSIT)) {
      res.status(400).json({ error: "Insufficient deposit" });
      return;
    }

    // Store the document with actual analysis metrics
    const documentHashIndex = await storeDocument({
      title,
      description,
      resourceLocation: url,
      documentHash,
      tokenCount: tokenCountNum,
      lexicalDensity: lexicalDensityNum,
      audienceEngagement: readabilityNum,
      vector,
    });

    // Return success response with actual values used
    res.json({
      success: true,
      documentHash,
      documentHashIndex,
      metrics: {
        tokenCount: tokenCountNum,
        lexicalDensity: lexicalDensityNum,
        readability: readabilityNum,
      },
    });
  } catch (error) {
    console.error("Error in /broadcast:", error);
    res.status(500).json({
      error: "Failed to process document",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/upload", upload.single("file"), async (req: MulterRequest, res) => {
  console.log("Processing new upload request...");

  if (!req.file) {
    res.status(400).send("No file uploaded");
    return;
  }

  try {
    const fileBuffer = await fs.readFile(req.file.path);
    const fileType = req.file.mimetype;

    // Delete the file immediately after reading its content
    await fs.unlink(req.file.path);

    if (!(fileType in ACCEPTABLE_FILE_TYPES)) {
      res
        .status(400)
        .send("Unsupported file type. Only PDF and TXT files are accepted.");
      return;
    }

    const analysisResult = await processDocument(fileBuffer, fileType);
    res.json(analysisResult);
  } catch (error) {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to delete uploaded file:", unlinkError);
      }
    }
    console.error("Document processing failed:", error);
    res.status(500).send("Error processing document");
  }
});

// Endpoint to get similar documents from blockchain
app.get("/similar-documents", (req: express.Request, res: express.Response) => {
  (async () => {
    try {
      const vector = req.query.vector;
      if (!vector || typeof vector !== "string") {
        return res.status(400).json({ error: "Vector parameter is required" });
      }

      // Parse the vector string into an array of numbers
      const queryVector = vector.split(",").map(Number);

      // Get all document hashes
      const documentHashes = await getDocumentHashes();
      const allDocuments = [];

      // Fetch all documents
      for (const hash of documentHashes) {
        try {
          const docs = await getDocumentsByHash(hash);
          allDocuments.push(...docs);
        } catch (error) {
          console.error(`Error fetching documents for hash ${hash}:`, error);
          // Continue with other documents even if one fails
        }
      }

      // Calculate similarity scores and sort documents
      const documentsWithScores = allDocuments.map((doc) => ({
        ...doc,
        similarity: calculateDocumentSimilarity(
          queryVector,
          doc.vector.split(",").map(Number)
        ),
      }));

      // Sort by similarity score in descending order
      const sortedDocuments = documentsWithScores
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10); // Get top 10 most similar documents

      res.json(sortedDocuments);
    } catch (error) {
      console.error("Error in similar-documents endpoint:", error);
      res.status(500).json({ error: "Failed to fetch similar documents" });
    }
  })();
});

// Start server and listen for requests
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
