import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupAuth } from "./auth";
import { insertUserSchema, insertGameSchema, insertSessionSchema, insertSessionParticipantSchema, insertUserAvailabilitySchema, insertForumCategorySchema, insertForumThreadSchema, insertForumPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Add a health check route for debugging
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // Check username availability
  app.get("/api/check-username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const existingUser = await storage.getUserByUsername(username);
      res.json({ available: !existingUser });
    } catch (error) {
      console.error("Error checking username availability:", error);
      res.status(500).json({ message: "Failed to check username availability" });
    }
  });
  
  // User Routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by Firebase UID:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game Routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const validatedData = insertGameSchema.parse(req.body);
      const newGame = await storage.createGame(validatedData);
      res.status(201).json(newGame);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.get("/api/games/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const games = await storage.getGamesByType(type);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games by type:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Session Routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const newSession = await storage.createSession(validatedData);
      res.status(201).json(newSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get("/api/sessions/upcoming", async (req, res) => {
    try {
      const sessions = await storage.getUpcomingSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/host/:hostId", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const sessions = await storage.getSessionsByHost(hostId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions by host:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/participant/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getSessionsByParticipant(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions by participant:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Session Participants Routes
  app.post("/api/session-participants", async (req, res) => {
    try {
      const validatedData = insertSessionParticipantSchema.parse(req.body);
      const result = await storage.addSessionParticipant(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error adding session participant:", error);
      res.status(500).json({ message: "Failed to add participant" });
    }
  });

  app.delete("/api/session-participants/:sessionId/:userId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const userId = parseInt(req.params.userId);
      
      await storage.removeSessionParticipant(sessionId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing session participant:", error);
      res.status(500).json({ message: "Failed to remove participant" });
    }
  });

  // User Availability Routes
  app.get("/api/user-availability/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const availability = await storage.getUserAvailability(userId);
      
      if (!availability) {
        return res.status(404).json({ message: "Availability not found" });
      }
      
      res.json(availability);
    } catch (error) {
      console.error("Error fetching user availability:", error);
      res.status(500).json({ message: "Failed to fetch user availability" });
    }
  });

  app.post("/api/user-availability", async (req, res) => {
    try {
      const validatedData = insertUserAvailabilitySchema.parse(req.body);
      const result = await storage.updateUserAvailability(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error updating user availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  // Forum Routes
  app.get("/api/forum-categories", async (req, res) => {
    try {
      const categories = await storage.getAllForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/forum-threads", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const threads = categoryId 
        ? await storage.getForumThreadsByCategory(categoryId)
        : await storage.getAllForumThreads();
      
      res.json(threads);
    } catch (error) {
      console.error("Error fetching forum threads:", error);
      res.status(500).json({ message: "Failed to fetch threads" });
    }
  });

  app.get("/api/forum-threads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const thread = await storage.getForumThread(id);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      res.json(thread);
    } catch (error) {
      console.error("Error fetching forum thread:", error);
      res.status(500).json({ message: "Failed to fetch thread" });
    }
  });

  app.post("/api/forum-threads", async (req, res) => {
    try {
      const validatedData = insertForumThreadSchema.parse(req.body);
      const newThread = await storage.createForumThread(validatedData);
      res.status(201).json(newThread);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid thread data", errors: error.errors });
      }
      
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  app.get("/api/forum-posts/:threadId", async (req, res) => {
    try {
      const threadId = parseInt(req.params.threadId);
      const posts = await storage.getForumPostsByThread(threadId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/forum-posts", async (req, res) => {
    try {
      const validatedData = insertForumPostSchema.parse(req.body);
      const newPost = await storage.createForumPost(validatedData);
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Session Matching API
  app.get("/api/match-sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const matchedSessions = await storage.findMatchingSessions(userId);
      res.json(matchedSessions);
    } catch (error) {
      console.error("Error matching sessions:", error);
      res.status(500).json({ message: "Failed to match sessions" });
    }
  });
  
  // Password Reset Request
  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      
      // In a real app, we would:
      // 1. Check if the email exists in our database
      // 2. Generate a unique token
      // 3. Save the token to the database with an expiration time
      // 4. Send an email with the reset link containing the token
      
      // For this demo, we'll just return a success message regardless of whether
      // the email exists or not (for security, don't reveal if an email exists)
      res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  
  // Password Reset with Token
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      // In a real app, we would:
      // 1. Verify the token exists and hasn't expired
      // 2. Find the user associated with the token
      // 3. Update the user's password
      // 4. Delete the used token
      
      // For this demo, we'll just return a success message
      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
