import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupAuth } from "./auth";
import { User, insertUserSchema, insertGameSchema, insertSessionSchema, insertSessionParticipantSchema, insertUserAvailabilitySchema, insertForumCategorySchema, insertForumThreadSchema, insertForumPostSchema, insertChatMessageSchema, insertSessionReviewSchema, insertContentReportSchema } from "@shared/schema";

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
  
  // Update user profile
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get current user from session
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const currentUser = req.user as Express.User;
      
      // Only allow users to update their own profile, unless they are admin
      if (currentUser.id !== id && currentUser.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this user" });
      }
      
      // Only allow updating certain fields
      const allowedFields = ["displayName", "bio", "location", "favoriteGames", "photoUrl"];
      const updateData: Partial<User> = {};
      
      for (const field of allowedFields) {
        if (field in req.body) {
          updateData[field as keyof Partial<User>] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
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
  
  // Leaderboard Routes
  app.get("/api/leaderboard/top-hosts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topHosts = await storage.getTopHosts(limit);
      res.json(topHosts);
    } catch (error) {
      console.error("Error fetching top hosts:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });
  
  app.get("/api/leaderboard/top-players", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topPlayers = await storage.getTopPlayers(limit);
      res.json(topPlayers);
    } catch (error) {
      console.error("Error fetching top players:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });
  
  // Combined endpoint for leaderboard data
  app.get("/api/user-stats/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topHosts = await storage.getTopHosts(limit);
      const topPlayers = await storage.getTopPlayers(limit);
      
      res.json({
        topHosts,
        topPlayers
      });
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });
  
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserStats(userId);
      
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  
  // Get user stats with recent reviews
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user stats
      const userStats = await storage.getUserStats(userId);
      if (!userStats) {
        // If no stats exist yet, return default values
        return res.json({
          sessionsHosted: 0,
          sessionsJoined: 0,
          reputation: 0,
          gamesPlayed: 0,
          hostRating: 0,
          playerRating: 0,
          reviewsReceived: 0,
          recentReviews: [],
        });
      }
      
      // Get recent reviews for this user (last 5)
      const recentReviews = await storage.getRecentReviewsForUser(userId, 5);
      
      // Format and return the response
      res.json({
        ...userStats,
        recentReviews,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  
  app.post("/api/session-reviews", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to submit reviews" });
      }
      
      // Validate the review data
      const validatedData = insertSessionReviewSchema.parse({
        ...req.body,
        reviewerId: req.user.id
      });
      
      const newReview = await storage.createSessionReview(validatedData);
      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      
      console.error("Error creating session review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });
  
  // Chat Message Routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllChatMessages();
      
      // Join the sender information for each message
      const messagesWithSenders = await Promise.all(messages.map(async (message) => {
        const sender = await storage.getUser(message.senderId);
        return {
          ...message,
          sender: sender ? {
            id: sender.id,
            username: sender.username,
            displayName: sender.displayName,
            photoUrl: sender.photoUrl
          } : null
        };
      }));
      
      res.json(messagesWithSenders);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  
  app.post("/api/messages", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to send messages" });
      }
      
      // Create message with authenticated user ID
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      
      const newMessage = await storage.createChatMessage(validatedData);
      
      // Add sender information to the response
      const messageWithSender = {
        ...newMessage,
        sender: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          photoUrl: req.user.photoUrl
        }
      };
      
      res.status(201).json(messageWithSender);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Admin Routes
  // Middleware to check if user is an admin
  const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };

  // Middleware to check if user is a moderator or admin
  const isModerator = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "Moderator access required" });
    }

    next();
  };

  // Get all admins
  app.get("/api/admin/admins", isAdmin, async (req, res) => {
    try {
      const admins = await storage.getAdmins();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // Get all moderators (includes admins)
  app.get("/api/admin/moderators", isAdmin, async (req, res) => {
    try {
      const moderators = await storage.getModerators();
      res.json(moderators);
    } catch (error) {
      console.error("Error fetching moderators:", error);
      res.status(500).json({ message: "Failed to fetch moderators" });
    }
  });

  // Update user role
  app.patch("/api/admin/users/:userId/role", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { role } = req.body;

      // Validate role
      if (!["user", "moderator", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Content Reports API
  // Get all reports
  app.get("/api/admin/content-reports", isModerator, async (req, res) => {
    try {
      const reports = await storage.getAllContentReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching content reports:", error);
      res.status(500).json({ message: "Failed to fetch content reports" });
    }
  });

  // Get pending reports
  app.get("/api/admin/content-reports/pending", isModerator, async (req, res) => {
    try {
      const reports = await storage.getPendingContentReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching pending reports:", error);
      res.status(500).json({ message: "Failed to fetch pending reports" });
    }
  });

  // Get specific report
  app.get("/api/admin/content-reports/:id", isModerator, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getContentReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching content report:", error);
      res.status(500).json({ message: "Failed to fetch content report" });
    }
  });

  // Create a content report
  app.post("/api/content-reports", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to report content" });
      }
      
      // Validate the report data
      const validatedData = insertContentReportSchema.parse({
        ...req.body,
        reporterId: req.user.id,
        status: "pending"
      });
      
      const newReport = await storage.createContentReport(validatedData);
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      
      console.error("Error creating content report:", error);
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  // Update content report status
  app.patch("/api/admin/content-reports/:id", isModerator, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, actionTaken } = req.body;
      
      // Validate status
      if (!["pending", "reviewed", "rejected", "actioned"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedReport = await storage.updateContentReportStatus(
        id, 
        status, 
        actionTaken, 
        req.user.id
      );
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating content report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // User Stats and Reputation API Routes
  // The user stats endpoint is already defined above
  
  // Get top users for leaderboard
  app.get("/api/user-stats/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (isNaN(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({ message: "Invalid limit parameter" });
      }
      
      // Get top hosts and players
      const topHosts = await storage.getTopHosts(limit);
      const topPlayers = await storage.getTopPlayers(limit);
      
      res.json({
        topHosts,
        topPlayers
      });
    } catch (error) {
      console.error("Error fetching top users:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });
  
  // Submit a session review
  app.post("/api/session-reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to submit reviews" });
    }
    
    try {
      const { sessionId, targetId, rating, content, isHostReview } = req.body;
      
      // Basic validation
      if (!sessionId || !targetId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid review data" });
      }
      
      // Create the review
      const review = await storage.createSessionReview({
        sessionId,
        reviewerId: req.user!.id,
        targetId,
        rating,
        content,
        isHostReview
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating session review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
