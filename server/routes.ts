import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserProgressSchema, 
  insertVocabularyProgressSchema, 
  insertExerciseResultSchema,
  insertConversationRecordingSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user progress for a specific module
  app.get("/api/progress/:userId/:moduleId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const moduleId = req.params.moduleId;
      const progress = await storage.getUserProgress(userId, moduleId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  // Get vocabulary progress
  app.get("/api/vocabulary-progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getVocabularyProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vocabulary progress" });
    }
  });

  // Update vocabulary progress
  app.post("/api/vocabulary-progress", async (req, res) => {
    try {
      const progressData = insertVocabularyProgressSchema.parse(req.body);
      const progress = await storage.updateVocabularyProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid vocabulary progress data" });
    }
  });

  // Save exercise result
  app.post("/api/exercise-results", async (req, res) => {
    try {
      const resultData = insertExerciseResultSchema.parse(req.body);
      const result = await storage.saveExerciseResult(resultData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid exercise result data" });
    }
  });

  // Get exercise results
  app.get("/api/exercise-results/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const exerciseId = req.query.exerciseId as string;
      const results = await storage.getExerciseResults(userId, exerciseId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercise results" });
    }
  });

  // Save conversation recording
  app.post("/api/conversation-recordings", async (req, res) => {
    try {
      const recordingData = insertConversationRecordingSchema.parse(req.body);
      const recording = await storage.saveConversationRecording(recordingData);
      res.json(recording);
    } catch (error) {
      res.status(400).json({ error: "Invalid recording data" });
    }
  });

  // Get conversation recordings
  app.get("/api/conversation-recordings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recordings = await storage.getConversationRecordings(userId);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation recordings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
