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

app.post("/upload", upload.single("file"), async (req: MulterRequest, res) => {
  const { title, url, description, publicKey } = req.body;

  console.log(title);
  console.log(publicKey);

  const goto_deposit = await getTotalDeposit(publicKey);
  const GOTO_DEPOSIT = process.env.GOTO_DEPOSIT;
  if (goto_deposit < ethers.parseEther(GOTO_DEPOSIT!)) {
    res.status(400).send("Insufficient deposit. Please increase your deposit.");
    return;
  }

  const withdrawSuccessful = await ownerWithdrawFrom(
    publicKey,
    ethers.parseEther(GOTO_DEPOSIT!)
  );
  if (!withdrawSuccessful) {
    res.status(400).send("Failed to collect deposit.");
    return;
  }

  console.log("Processing new upload request...");

  console.log("Title:", title);
  console.log("URL:", url);
  console.log("Description:", description);

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
    const { documentHash } = analysisResult;

    console.log(documentHash);
    console.log(analysisResult);
    console.log(Object.values(analysisResult.embedding).join(","));
    await storeDocument({
      title,
      description,
      resourceLocation: url,
      documentHash,
      tokenCount: analysisResult.tokenCount,
      lexicalDensity: analysisResult.lexicalDensity,
      audienceEngagement: analysisResult.readability,
      vector: Object.values(analysisResult.embedding).join(","),
    });
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
