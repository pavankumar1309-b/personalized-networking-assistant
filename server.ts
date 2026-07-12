import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Database } from "./server/database/db";
import { generateNetworkingStarters } from "./server/services/gemini";
import { verifyTopicWithWikipedia } from "./server/services/wikipedia";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // API ROUTES

  // 1. POST /api/generate & /generate
  const generateHandler = async (req: Request, res: Response): Promise<void> => {
    const { event_description, interests, profession, goal } = req.body;

    if (!event_description || !profession || !goal) {
      res.status(400).json({ error: "Missing required fields: event_description, profession, and goal are required." });
      return;
    }

    const cleanInterests = Array.isArray(interests)
      ? interests.map((i: any) => String(i).trim()).filter(Boolean)
      : typeof interests === "string" && interests.trim()
      ? [interests.trim()]
      : [];

    try {
      // NLP & AI generation
      const result = await generateNetworkingStarters({
        event_description: String(event_description).trim(),
        interests: cleanInterests,
        profession: String(profession).trim(),
        goal: String(goal).trim(),
      });

      // Save to database
      const savedEntry = Database.addEntry({
        event_description: String(event_description).trim(),
        interests: cleanInterests,
        profession: String(profession).trim(),
        goal: String(goal).trim(),
        themes: result.themes,
        keywords: result.keywords,
        starters: result.conversation_starters,
      });

      res.status(200).json({
        id: savedEntry.id,
        themes: result.themes,
        keywords: result.keywords,
        technologies: result.technologies,
        industries: result.industries,
        conversation_starters: result.conversation_starters,
        timestamp: savedEntry.timestamp,
      });
    } catch (error: any) {
      console.error("Generator endpoint error:", error);
      res.status(500).json({ error: "Failed to generate starters. Please try again." });
    }
  };

  app.post("/api/generate", generateHandler);
  app.post("/generate", generateHandler);

  // 2. POST /api/factcheck & /factcheck
  const factCheckHandler = async (req: Request, res: Response): Promise<void> => {
    const { topic } = req.body;
    if (!topic || !String(topic).trim()) {
      res.status(400).json({ error: "Missing required field: topic is required." });
      return;
    }

    try {
      const verification = await verifyTopicWithWikipedia(String(topic).trim());
      res.status(200).json(verification);
    } catch (error) {
      console.error("Fact check endpoint error:", error);
      res.status(500).json({ error: "Failed to verify topic." });
    }
  };

  app.post("/api/factcheck", factCheckHandler);
  app.post("/factcheck", factCheckHandler);

  // 3. GET /api/history & /history
  const historyHandler = (req: Request, res: Response): void => {
    try {
      const { query, interests } = req.query;
      let filterInterests: string[] = [];

      if (typeof interests === "string" && interests.trim()) {
        filterInterests = interests.split(",").map((i) => i.trim()).filter(Boolean);
      }

      if (query || filterInterests.length > 0) {
        const results = Database.searchHistory(String(query || ""), filterInterests);
        res.status(200).json(results);
      } else {
        const history = Database.getHistory();
        res.status(200).json(history);
      }
    } catch (error) {
      console.error("History query endpoint error:", error);
      res.status(500).json({ error: "Failed to fetch history." });
    }
  };

  app.get("/api/history", historyHandler);
  app.get("/history", historyHandler);

  // 4. POST /api/feedback & /feedback
  const feedbackHandler = (req: Request, res: Response): void => {
    const { entryId, starterId, feedback } = req.body;
    if (!entryId || !starterId) {
      res.status(400).json({ error: "Missing required fields: entryId and starterId are required." });
      return;
    }

    if (feedback !== "helpful" && feedback !== "not_helpful" && feedback !== null) {
      res.status(400).json({ error: "Feedback must be 'helpful', 'not_helpful', or null." });
      return;
    }

    try {
      const updated = Database.updateStarterFeedback(String(entryId), String(starterId), feedback);
      if (updated) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Entry or starter not found." });
      }
    } catch (error) {
      console.error("Feedback endpoint error:", error);
      res.status(500).json({ error: "Failed to save feedback." });
    }
  };

  app.post("/api/feedback", feedbackHandler);
  app.post("/feedback", feedbackHandler);

  // 5. DELETE /api/history/:id & /history/:id
  const deleteHandler = (req: Request, res: Response): void => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Missing required route parameter: id is required." });
      return;
    }

    try {
      const deleted = Database.deleteEntry(id);
      if (deleted) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: `Entry with ID ${id} not found.` });
      }
    } catch (error) {
      console.error("Delete history endpoint error:", error);
      res.status(500).json({ error: "Failed to delete history entry." });
    }
  };

  app.delete("/api/history/:id", deleteHandler);
  app.delete("/history/:id", deleteHandler);

  // 6. GET /api/analytics & /analytics
  const analyticsHandler = (req: Request, res: Response): void => {
    try {
      const analytics = Database.getAnalytics();
      res.status(200).json(analytics);
    } catch (error) {
      console.error("Analytics endpoint error:", error);
      res.status(500).json({ error: "Failed to fetch analytics." });
    }
  };

  app.get("/api/analytics", analyticsHandler);
  app.get("/analytics", analyticsHandler);

  // INTEGRATE VITE FOR SPA / FRONTEND CLIENT SERVING

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static file serving loaded from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Personalized Networking Assistant running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
