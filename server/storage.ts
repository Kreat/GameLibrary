import {
  users, games, sessions, sessionParticipants, userAvailability,
  forumCategories, forumThreads, forumPosts, chatMessages, contentReports,
  type User, type InsertUser,
  type Game, type InsertGame,
  type Session, type InsertSession,
  type SessionParticipant, type InsertSessionParticipant,
  type UserAvailability, type InsertUserAvailability,
  type ForumCategory, type InsertForumCategory,
  type ForumThread, type InsertForumThread,
  type ForumPost, type InsertForumPost,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

import {
  type UserStats, type InsertUserStats, 
  type SessionReview, type InsertSessionReview,
  type ContentReport, type InsertContentReport
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  
  // Game methods
  getAllGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  getGamesByType(type: string): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Session methods
  getAllSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  getUpcomingSessions(): Promise<Session[]>;
  getSessionsByHost(hostId: number): Promise<Session[]>;
  getSessionsByParticipant(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  
  // Session Participants methods
  getSessionParticipants(sessionId: number): Promise<SessionParticipant[]>;
  addSessionParticipant(participant: InsertSessionParticipant): Promise<SessionParticipant>;
  removeSessionParticipant(sessionId: number, userId: number): Promise<void>;
  
  // User Availability methods
  getUserAvailability(userId: number): Promise<UserAvailability | undefined>;
  updateUserAvailability(availability: InsertUserAvailability): Promise<UserAvailability>;
  
  // Forum methods
  getAllForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: number): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  
  getAllForumThreads(): Promise<ForumThread[]>;
  getForumThreadsByCategory(categoryId: number): Promise<ForumThread[]>;
  getForumThread(id: number): Promise<ForumThread | undefined>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  
  getForumPostsByThread(threadId: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  
  // Matching algorithm
  findMatchingSessions(userId: number): Promise<Session[]>;
  
  // Chat methods
  getAllChatMessages(): Promise<ChatMessage[]>;
  getChatMessageById(id: number): Promise<ChatMessage | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // User Stats and Leaderboard methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createOrUpdateUserStats(stats: InsertUserStats): Promise<UserStats>;
  getTopHosts(limit?: number): Promise<(UserStats & { user: User })[]>;
  getTopPlayers(limit?: number): Promise<(UserStats & { user: User })[]>;
  createSessionReview(review: InsertSessionReview): Promise<SessionReview>;
  getRecentReviewsForUser(userId: number, limit?: number): Promise<Array<SessionReview & { reviewer: { username: string; displayName: string | null } }>>;
  
  // Admin and moderation methods
  getAdmins(): Promise<User[]>;
  getModerators(): Promise<User[]>;
  getAllContentReports(): Promise<ContentReport[]>;
  getPendingContentReports(): Promise<ContentReport[]>;
  getContentReport(id: number): Promise<ContentReport | undefined>;
  createContentReport(report: InsertContentReport): Promise<ContentReport>;
  updateContentReportStatus(reportId: number, status: string, actionTaken?: string, adminId?: number): Promise<ContentReport | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private sessions: Map<number, Session>;
  private sessionParticipants: Map<number, SessionParticipant>;
  private userAvailabilities: Map<number, UserAvailability>;
  private forumCategories: Map<number, ForumCategory>;
  private forumThreads: Map<number, ForumThread>;
  private forumPosts: Map<number, ForumPost>;
  private chatMessages: Map<number, ChatMessage>;
  private userStats: Map<number, UserStats>;
  private sessionReviews: Map<number, SessionReview>;
  
  private userIdCounter: number;
  private gameIdCounter: number;
  private sessionIdCounter: number;
  private participantIdCounter: number;
  private availabilityIdCounter: number;
  private categoryIdCounter: number;
  private threadIdCounter: number;
  private postIdCounter: number;
  private messageIdCounter: number;

  private contentReports: Map<number, ContentReport>;
  private contentReportIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.sessions = new Map();
    this.sessionParticipants = new Map();
    this.userAvailabilities = new Map();
    this.forumCategories = new Map();
    this.forumThreads = new Map();
    this.forumPosts = new Map();
    this.chatMessages = new Map();
    this.userStats = new Map();
    this.sessionReviews = new Map();
    this.contentReports = new Map();
    
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.sessionIdCounter = 1;
    this.participantIdCounter = 1;
    this.availabilityIdCounter = 1;
    this.categoryIdCounter = 1;
    this.threadIdCounter = 1;
    this.postIdCounter = 1;
    this.messageIdCounter = 1;
    this.contentReportIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Initialize forum categories
    const categories = [
      { name: "General Discussion", description: "Talk about anything game-related", slug: "general", iconName: "MessageSquare", color: "bg-primary" },
      { name: "Board Games", description: "Strategy, eurogames, family games and more", slug: "board-games", iconName: "GameController", color: "bg-amber-500" },
      { name: "Card Games", description: "Collectible, trading, and traditional card games", slug: "card-games", iconName: "FileText", color: "bg-accent" },
      { name: "Tabletop RPGs", description: "Role-playing games, campaigns, and GM resources", slug: "rpg", iconName: "Swords", color: "bg-purple-800" },
      { name: "Looking For Group", description: "Find players for your next gaming session", slug: "lfg", iconName: "Users", color: "bg-green-600" }
    ];
    
    categories.forEach(category => {
      this.createForumCategory({
        name: category.name,
        description: category.description,
        slug: category.slug,
        iconName: category.iconName,
        color: category.color
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      updatedAt 
    };
    
    this.users.set(id, user);
    return user;
  }

  // Game methods
  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGamesByType(type: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.type === type);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const game: Game = {
      ...insertGame,
      id,
      createdAt,
      updatedAt
    };
    
    this.games.set(id, game);
    return game;
  }

  // Session methods
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getUpcomingSessions(): Promise<Session[]> {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      session => new Date(session.startTime) > now
    ).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  async getSessionsByHost(hostId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.hostId === hostId
    );
  }

  async getSessionsByParticipant(userId: number): Promise<Session[]> {
    // Get all session IDs where this user is a participant
    const participantSessions = Array.from(this.sessionParticipants.values())
      .filter(participant => participant.userId === userId)
      .map(participant => participant.sessionId);
    
    // Return all sessions where the user is a participant
    return Array.from(this.sessions.values()).filter(
      session => participantSessions.includes(session.id)
    );
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const session: Session = {
      ...insertSession,
      id,
      createdAt,
      updatedAt
    };
    
    this.sessions.set(id, session);
    
    // Automatically add the host as a participant
    await this.addSessionParticipant({
      sessionId: id,
      userId: insertSession.hostId,
      isHost: true
    });
    
    return session;
  }

  // Session Participants methods
  async getSessionParticipants(sessionId: number): Promise<SessionParticipant[]> {
    return Array.from(this.sessionParticipants.values()).filter(
      participant => participant.sessionId === sessionId
    );
  }

  async addSessionParticipant(insertParticipant: InsertSessionParticipant): Promise<SessionParticipant> {
    // Check if this user is already a participant in this session
    const existingParticipant = Array.from(this.sessionParticipants.values()).find(
      p => p.sessionId === insertParticipant.sessionId && p.userId === insertParticipant.userId
    );
    
    if (existingParticipant) {
      return existingParticipant;
    }
    
    const id = this.participantIdCounter++;
    const joinedAt = new Date();
    
    const participant: SessionParticipant = {
      ...insertParticipant,
      id,
      joinedAt
    };
    
    this.sessionParticipants.set(id, participant);
    
    // Update the current player count for the session
    const session = await this.getSession(insertParticipant.sessionId);
    if (session) {
      const updatedSession = { 
        ...session, 
        currentPlayers: session.currentPlayers + 1,
        updatedAt: new Date()
      };
      this.sessions.set(session.id, updatedSession);
    }
    
    return participant;
  }

  async removeSessionParticipant(sessionId: number, userId: number): Promise<void> {
    // Find participant entry
    const participant = Array.from(this.sessionParticipants.values()).find(
      p => p.sessionId === sessionId && p.userId === userId
    );
    
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    // Cannot remove the host
    if (participant.isHost) {
      throw new Error("Cannot remove the host from a session");
    }
    
    // Remove participant
    this.sessionParticipants.delete(participant.id);
    
    // Update the current player count for the session
    const session = await this.getSession(sessionId);
    if (session) {
      const updatedSession = { 
        ...session, 
        currentPlayers: Math.max(1, session.currentPlayers - 1),
        updatedAt: new Date()
      };
      this.sessions.set(session.id, updatedSession);
    }
  }

  // User Availability methods
  async getUserAvailability(userId: number): Promise<UserAvailability | undefined> {
    return Array.from(this.userAvailabilities.values()).find(
      availability => availability.userId === userId
    );
  }

  async updateUserAvailability(insertAvailability: InsertUserAvailability): Promise<UserAvailability> {
    // Check if availability already exists for this user
    const existingAvailability = await this.getUserAvailability(insertAvailability.userId);
    
    if (existingAvailability) {
      // Update existing
      const updatedAvailability: UserAvailability = {
        ...existingAvailability,
        ...insertAvailability,
        updatedAt: new Date()
      };
      
      this.userAvailabilities.set(existingAvailability.id, updatedAvailability);
      return updatedAvailability;
    } else {
      // Create new
      const id = this.availabilityIdCounter++;
      const updatedAt = new Date();
      
      const availability: UserAvailability = {
        ...insertAvailability,
        id,
        updatedAt
      };
      
      this.userAvailabilities.set(id, availability);
      return availability;
    }
  }

  // Forum Category methods
  async getAllForumCategories(): Promise<ForumCategory[]> {
    return Array.from(this.forumCategories.values());
  }

  async getForumCategory(id: number): Promise<ForumCategory | undefined> {
    return this.forumCategories.get(id);
  }

  async createForumCategory(insertCategory: InsertForumCategory): Promise<ForumCategory> {
    const id = this.categoryIdCounter++;
    const createdAt = new Date();
    
    const category: ForumCategory = {
      ...insertCategory,
      id,
      createdAt
    };
    
    this.forumCategories.set(id, category);
    return category;
  }

  // Forum Thread methods
  async getAllForumThreads(): Promise<ForumThread[]> {
    return Array.from(this.forumThreads.values());
  }

  async getForumThreadsByCategory(categoryId: number): Promise<ForumThread[]> {
    return Array.from(this.forumThreads.values()).filter(
      thread => thread.categoryId === categoryId
    );
  }

  async getForumThread(id: number): Promise<ForumThread | undefined> {
    return this.forumThreads.get(id);
  }

  async createForumThread(insertThread: InsertForumThread): Promise<ForumThread> {
    const id = this.threadIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const lastPostAt = new Date();
    
    const thread: ForumThread = {
      ...insertThread,
      id,
      views: 0,
      createdAt,
      updatedAt,
      lastPostAt
    };
    
    this.forumThreads.set(id, thread);
    return thread;
  }

  // Forum Post methods
  async getForumPostsByThread(threadId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .filter(post => post.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const id = this.postIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const post: ForumPost = {
      ...insertPost,
      id,
      likes: 0,
      createdAt,
      updatedAt
    };
    
    this.forumPosts.set(id, post);
    
    // Update the thread's lastPostAt timestamp
    const thread = await this.getForumThread(insertPost.threadId);
    if (thread) {
      const updatedThread = {
        ...thread,
        lastPostAt: createdAt,
        updatedAt: createdAt
      };
      this.forumThreads.set(thread.id, updatedThread);
    }
    
    return post;
  }

  // Session Matching algorithm
  async findMatchingSessions(userId: number): Promise<Session[]> {
    // Get user's availability
    const userAvail = await this.getUserAvailability(userId);
    if (!userAvail) {
      // If no availability set, return upcoming sessions sorted by start time
      return this.getUpcomingSessions();
    }
    
    // Get all upcoming sessions
    const upcomingSessions = await this.getUpcomingSessions();
    
    // Define a function to score sessions based on user availability
    const scoreSession = (session: Session): number => {
      let score = 0;
      const startTime = new Date(session.startTime);
      const day = startTime.getDay();
      const hour = startTime.getHours();
      
      // Determine if it's a weekday or weekend
      const isWeekend = day === 0 || day === 6; // Sunday or Saturday
      
      // Determine time of day: 0-11 morning, 12-16 afternoon, 17-23 evening
      const isMorning = hour >= 0 && hour < 12;
      const isAfternoon = hour >= 12 && hour < 17;
      const isEvening = hour >= 17 && hour < 24;
      
      // Check if user is available during this time
      if (isWeekend) {
        if (isMorning && userAvail.weekendMorning) score += 3;
        if (isAfternoon && userAvail.weekendAfternoon) score += 3;
        if (isEvening && userAvail.weekendEvening) score += 3;
      } else {
        if (isMorning && userAvail.weekdayMorning) score += 3;
        if (isAfternoon && userAvail.weekdayAfternoon) score += 3;
        if (isEvening && userAvail.weekdayEvening) score += 3;
      }
      
      // Give higher score to sessions with more spots available
      const spotsAvailable = session.maxPlayers - session.currentPlayers;
      score += Math.min(spotsAvailable, 3); // Up to 3 points for available spots
      
      // Give bonus points for sessions happening soon (but not too soon)
      const daysUntilSession = (startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilSession > 0 && daysUntilSession < 7) {
        score += 2; // Bonus for sessions within the next week
      }
      
      return score;
    };
    
    // Score and sort sessions
    return upcomingSessions
      .map(session => ({ session, score: scoreSession(session) }))
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .map(item => item.session);
  }

  // Chat methods
  // async getAllChatMessages(): Promise<ChatMessage[]> {
  //   // TODO
  //   return;
  // };
  // async getChatMessageById(id: number): Promise<ChatMessage | undefined> {
  //   // TODO
  //   return;
  // };
  // async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
  //   // TODO
  //   return;
  // };

  //Add chat message methods to MemStorage implementation
  async getAllChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

    async getChatMessageById(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  };

    async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();

    const wrappedMsg: ChatMessage = {
      ...message,
      id,
      timestamp
    };

    this.chatMessages.set(id, wrappedMsg);
    return wrappedMsg;
  };
  
  // User Stats and Leaderboard methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      stats => stats.userId === userId
    );
  }

  async createOrUpdateUserStats(stats: InsertUserStats): Promise<UserStats> {
    // Check if stats already exist for this user
    const existingStats = await this.getUserStats(stats.userId);
    
    if (existingStats) {
      // Update existing stats
      const updatedStats: UserStats = {
        ...existingStats,
        ...stats,
        updatedAt: new Date()
      };
      
      this.userStats.set(existingStats.id, updatedStats);
      return updatedStats;
    } else {
      // Create new stats
      const id = this.userIdCounter++; // Reusing userIdCounter for simplicity
      const updatedAt = new Date();
      
      const newStats: UserStats = {
        ...stats,
        id,
        updatedAt
      };
      
      this.userStats.set(id, newStats);
      return newStats;
    }
  }

  async getTopHosts(limit: number = 10): Promise<(UserStats & { user: User })[]> {
    // Get all user stats sorted by host rating (descending)
    const sortedStats = Array.from(this.userStats.values())
      .sort((a, b) => {
        // First sort by host rating
        if (b.hostRating !== a.hostRating) {
          return b.hostRating - a.hostRating;
        }
        // Then by sessions hosted
        return b.sessionsHosted - a.sessionsHosted;
      })
      .slice(0, limit);
    
    // Add user data to each stats entry
    const statsWithUsers = [];
    for (const stats of sortedStats) {
      const user = await this.getUser(stats.userId);
      if (user) {
        statsWithUsers.push({ ...stats, user });
      }
    }
    
    return statsWithUsers;
  }

  async getTopPlayers(limit: number = 10): Promise<(UserStats & { user: User })[]> {
    // Get all user stats sorted by player rating (descending)
    const sortedStats = Array.from(this.userStats.values())
      .sort((a, b) => {
        // First sort by player rating
        if (b.playerRating !== a.playerRating) {
          return b.playerRating - a.playerRating;
        }
        // Then by sessions joined
        return b.sessionsJoined - a.sessionsJoined;
      })
      .slice(0, limit);
    
    // Add user data to each stats entry
    const statsWithUsers = [];
    for (const stats of sortedStats) {
      const user = await this.getUser(stats.userId);
      if (user) {
        statsWithUsers.push({ ...stats, user });
      }
    }
    
    return statsWithUsers;
  }

  async createSessionReview(review: InsertSessionReview): Promise<SessionReview> {
    const id = this.userIdCounter++; // Reusing userIdCounter for simplicity
    const createdAt = new Date();
    
    const newReview: SessionReview = {
      ...review,
      id,
      createdAt
    };
    
    this.sessionReviews.set(id, newReview);
    
    // Update the user stats based on the review
    const targetStats = await this.getUserStats(review.targetId);
    
    if (targetStats) {
      const updatedStats = { 
        ...targetStats,
        reviewsReceived: targetStats.reviewsReceived + 1,
        updatedAt: new Date()
      };
      
      // Update the appropriate rating
      if (review.isHostReview) {
        // This is a review of a host
        const newRating = Math.round(
          (targetStats.hostRating * targetStats.reviewsReceived + review.rating) / 
          (targetStats.reviewsReceived + 1)
        );
        updatedStats.hostRating = newRating;
      } else {
        // This is a review of a player
        const newRating = Math.round(
          (targetStats.playerRating * targetStats.reviewsReceived + review.rating) / 
          (targetStats.reviewsReceived + 1)
        );
        updatedStats.playerRating = newRating;
      }
      
      this.userStats.set(targetStats.id, updatedStats);
    } else {
      // Create new stats for this user
      const initialRating = review.rating;
      await this.createOrUpdateUserStats({
        userId: review.targetId,
        sessionsHosted: review.isHostReview ? 1 : 0,
        sessionsJoined: review.isHostReview ? 0 : 1,
        reputation: 0,
        gamesPlayed: 1,
        hostRating: review.isHostReview ? initialRating : 0,
        playerRating: review.isHostReview ? 0 : initialRating,
        reviewsReceived: 1
      });
    }
    
    return newReview;
  }
  
  async getRecentReviewsForUser(userId: number, limit: number = 5): Promise<Array<SessionReview & { reviewer: { username: string; displayName: string | null } }>> {
    // Get all reviews for this user
    const reviews = Array.from(this.sessionReviews.values())
      .filter(review => review.targetId === userId)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);
    
    // Add reviewer information
    const result = [];
    for (const review of reviews) {
      const reviewer = await this.getUser(review.reviewerId);
      if (reviewer) {
        result.push({
          ...review,
          reviewer: {
            username: reviewer.username,
            displayName: reviewer.displayName
          }
        });
      }
    }
    
    return result;
  }

  // Update user profile
  async updateUser(userId: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // Create updated user with new data
    const updatedUser = {
      ...user,
      ...userData,
      // Ensure these fields aren't overwritten
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: userData.role !== undefined ? userData.role : user.role,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // User role management
  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    return this.updateUser(userId, { role });
  }

  // Admin and moderation methods
  async getAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "admin");
  }

  async getModerators(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      user.role === "moderator" || user.role === "admin"
    );
  }

  async getAllContentReports(): Promise<ContentReport[]> {
    return Array.from(this.contentReports.values());
  }

  async getPendingContentReports(): Promise<ContentReport[]> {
    return Array.from(this.contentReports.values())
      .filter(report => report.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getContentReport(id: number): Promise<ContentReport | undefined> {
    return this.contentReports.get(id);
  }

  async createContentReport(report: InsertContentReport): Promise<ContentReport> {
    const id = this.contentReportIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newReport: ContentReport = {
      ...report,
      id,
      createdAt,
      updatedAt,
      status: report.status || "pending",
      actionTaken: report.actionTaken || null,
      adminId: report.adminId || null
    };
    
    this.contentReports.set(id, newReport);
    return newReport;
  }

  async updateContentReportStatus(
    reportId: number, 
    status: string, 
    actionTaken?: string, 
    adminId?: number
  ): Promise<ContentReport | undefined> {
    const report = await this.getContentReport(reportId);
    if (!report) return undefined;
    
    const updatedReport: ContentReport = {
      ...report,
      status,
      actionTaken: actionTaken || report.actionTaken,
      adminId: adminId || report.adminId,
      updatedAt: new Date()
    };
    
    this.contentReports.set(reportId, updatedReport);
    return updatedReport;
  }
}

import { DatabaseStorage } from './database-storage';

export const storage = new DatabaseStorage();
