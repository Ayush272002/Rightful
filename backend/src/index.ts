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
