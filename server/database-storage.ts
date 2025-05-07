import { eq, and, or, gt, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, games, sessions, sessionParticipants, userAvailability,
  forumCategories, forumThreads, forumPosts, chatMessages,
  userStats, sessionReviews,
  type User, type InsertUser,
  type Game, type InsertGame,
  type Session, type InsertSession,
  type SessionParticipant, type InsertSessionParticipant,
  type UserAvailability, type InsertUserAvailability,
  type ForumCategory, type InsertForumCategory,
  type ForumThread, type InsertForumThread,
  type ForumPost, type InsertForumPost,
  type ChatMessage, type InsertChatMessage,
  type UserStats, type InsertUserStats,
  type SessionReview, type InsertSessionReview
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure null values are properly set for optional fields
    const userWithNulls = {
      ...insertUser,
      displayName: insertUser.displayName ?? null,
      bio: insertUser.bio ?? null,
      location: insertUser.location ?? null,
      favoriteGames: insertUser.favoriteGames ?? null,
      photoUrl: insertUser.photoUrl ?? null,
      firebaseUid: insertUser.firebaseUid ?? null
    };
    
    const [user] = await db.insert(users).values(userWithNulls).returning();
    return user;
  }

  // Game methods
  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getGamesByType(type: string): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.type, type));
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    // Ensure null values are properly set for optional fields
    const gameWithNulls = {
      ...insertGame,
      description: insertGame.description ?? null,
      minPlayers: insertGame.minPlayers ?? null,
      maxPlayers: insertGame.maxPlayers ?? null,
      complexity: insertGame.complexity ?? null,
      playTime: insertGame.playTime ?? null,
      imageUrl: insertGame.imageUrl ?? null
    };
    
    const [game] = await db.insert(games).values(gameWithNulls).returning();
    return game;
  }

  // Session methods
  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getUpcomingSessions(): Promise<Session[]> {
    const now = new Date();
    return await db.select()
      .from(sessions)
      .where(gt(sessions.startTime, now))
      .orderBy(sessions.startTime);
  }

  async getSessionsByHost(hostId: number): Promise<Session[]> {
    return await db.select()
      .from(sessions)
      .where(eq(sessions.hostId, hostId));
  }

  async getSessionsByParticipant(userId: number): Promise<Session[]> {
    // Get sessions where the user is a participant
    const participantSessions = await db.select({
      sessionId: sessionParticipants.sessionId
    })
    .from(sessionParticipants)
    .where(eq(sessionParticipants.userId, userId));
    
    const participantSessionIds = participantSessions.map(p => p.sessionId);
    
    if (participantSessionIds.length === 0) {
      // If user not a participant in any sessions, return empty array
      return [];
    }
    
    return await db.select()
      .from(sessions)
      .where(sql`${sessions.id} IN (${participantSessionIds.join(',')})`);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    // Ensure null values are properly set for optional fields
    const sessionWithNulls = {
      ...insertSession,
      description: insertSession.description ?? null,
      address: insertSession.address ?? null,
      locationNotes: insertSession.locationNotes ?? null,
      duration: insertSession.duration ?? null,
      recurring: insertSession.recurring ?? "once",
      gameId: insertSession.gameId ?? null,
      hostData: insertSession.hostData ?? null,
      participantsData: insertSession.participantsData ?? null
    };
    
    const [session] = await db.insert(sessions).values(sessionWithNulls).returning();
    
    // Automatically add the host as a participant
    await this.addSessionParticipant({
      sessionId: session.id,
      userId: session.hostId,
      isHost: true
    });
    
    return session;
  }

  // Session Participants methods
  async getSessionParticipants(sessionId: number): Promise<SessionParticipant[]> {
    return await db.select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, sessionId));
  }

  async addSessionParticipant(insertParticipant: InsertSessionParticipant): Promise<SessionParticipant> {
    // Check if user is already a participant
    const existing = await db.select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, insertParticipant.sessionId),
          eq(sessionParticipants.userId, insertParticipant.userId)
        )
      );
      
    if (existing.length > 0) {
      return existing[0];
    }
    
    // Ensure null values are properly set for optional fields
    const participantWithNulls = {
      sessionId: insertParticipant.sessionId,
      userId: insertParticipant.userId,
      isHost: insertParticipant.isHost ?? null,
      joinedAt: new Date()
    };
    
    const [participant] = await db.insert(sessionParticipants)
      .values(participantWithNulls)
      .returning();
    
    // Update current players count
    const session = await this.getSession(insertParticipant.sessionId);
    if (session) {
      await db.update(sessions)
        .set({ 
          currentPlayers: session.currentPlayers + 1,
          updatedAt: new Date()
        })
        .where(eq(sessions.id, session.id));
    }
    
    return participant;
  }

  async removeSessionParticipant(sessionId: number, userId: number): Promise<void> {
    // Find the participant to check if they're a host
    const [participant] = await db.select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        )
      );
    
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    // Cannot remove the host
    if (participant.isHost) {
      throw new Error("Cannot remove the host from a session");
    }
    
    // Remove the participant
    await db.delete(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        )
      );
    
    // Update player count
    const session = await this.getSession(sessionId);
    if (session) {
      await db.update(sessions)
        .set({ 
          currentPlayers: Math.max(1, session.currentPlayers - 1),
          updatedAt: new Date()
        })
        .where(eq(sessions.id, session.id));
    }
  }

  // User Availability methods
  async getUserAvailability(userId: number): Promise<UserAvailability | undefined> {
    const [availability] = await db.select()
      .from(userAvailability)
      .where(eq(userAvailability.userId, userId));
    
    return availability;
  }

  async updateUserAvailability(insertAvailability: InsertUserAvailability): Promise<UserAvailability> {
    // Ensure null values are properly set for optional fields
    const availabilityWithNulls = {
      ...insertAvailability,
      weekdayMorning: insertAvailability.weekdayMorning ?? false,
      weekdayAfternoon: insertAvailability.weekdayAfternoon ?? false,
      weekdayEvening: insertAvailability.weekdayEvening ?? false,
      weekendMorning: insertAvailability.weekendMorning ?? false,
      weekendAfternoon: insertAvailability.weekendAfternoon ?? false,
      weekendEvening: insertAvailability.weekendEvening ?? false,
      notes: insertAvailability.notes ?? null
    };
    
    const existingAvailability = await this.getUserAvailability(insertAvailability.userId);
    
    if (existingAvailability) {
      // Update existing
      const [updated] = await db.update(userAvailability)
        .set({
          ...availabilityWithNulls,
          updatedAt: new Date()
        })
        .where(eq(userAvailability.id, existingAvailability.id))
        .returning();
      
      return updated;
    } else {
      // Create new
      const [availability] = await db.insert(userAvailability)
        .values(availabilityWithNulls)
        .returning();
      
      return availability;
    }
  }

  // Forum methods
  async getAllForumCategories(): Promise<ForumCategory[]> {
    return await db.select().from(forumCategories);
  }

  async getForumCategory(id: number): Promise<ForumCategory | undefined> {
    const [category] = await db.select()
      .from(forumCategories)
      .where(eq(forumCategories.id, id));
    
    return category;
  }

  async createForumCategory(insertCategory: InsertForumCategory): Promise<ForumCategory> {
    // Ensure null values are properly set for optional fields
    const categoryWithNulls = {
      ...insertCategory,
      description: insertCategory.description ?? null,
      iconName: insertCategory.iconName ?? null,
      color: insertCategory.color ?? null
    };
    
    const [category] = await db.insert(forumCategories)
      .values(categoryWithNulls)
      .returning();
    
    return category;
  }

  async getAllForumThreads(): Promise<ForumThread[]> {
    return await db.select().from(forumThreads);
  }

  async getForumThreadsByCategory(categoryId: number): Promise<ForumThread[]> {
    return await db.select()
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId));
  }

  async getForumThread(id: number): Promise<ForumThread | undefined> {
    const [thread] = await db.select()
      .from(forumThreads)
      .where(eq(forumThreads.id, id));
    
    return thread;
  }

  async createForumThread(insertThread: InsertForumThread): Promise<ForumThread> {
    const now = new Date();
    const threadWithNulls = {
      ...insertThread,
      isPinned: insertThread.isPinned ?? false,
      isLocked: insertThread.isLocked ?? false,
      tags: insertThread.tags ?? null,
      views: 0,
      lastPostAt: now
    };
    
    const [thread] = await db.insert(forumThreads)
      .values(threadWithNulls)
      .returning();
    
    return thread;
  }

  async getForumPostsByThread(threadId: number): Promise<ForumPost[]> {
    return await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.threadId, threadId))
      .orderBy(forumPosts.createdAt);
  }

  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const [post] = await db.insert(forumPosts)
      .values(insertPost)
      .returning();
    
    // Update the thread's lastPostAt time
    await db.update(forumThreads)
      .set({ 
        lastPostAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(forumThreads.id, insertPost.threadId));
    
    return post;
  }

  async findMatchingSessions(userId: number): Promise<Session[]> {
    const userAvail = await this.getUserAvailability(userId);
    if (!userAvail) {
      // If no availability set, return upcoming sessions sorted by start time
      return this.getUpcomingSessions();
    }
    
    // Get all upcoming sessions
    const upcomingSessions = await this.getUpcomingSessions();
    
    // Filter sessions based on user availability
    const matchingSessions = upcomingSessions.filter(session => {
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
        return (isMorning && userAvail.weekendMorning) || 
               (isAfternoon && userAvail.weekendAfternoon) || 
               (isEvening && userAvail.weekendEvening);
      } else {
        return (isMorning && userAvail.weekdayMorning) || 
               (isAfternoon && userAvail.weekdayAfternoon) || 
               (isEvening && userAvail.weekdayEvening);
      }
    });
    
    // Return sessions sorted by start time (already sorted by getUpcomingSessions)
    return matchingSessions;
  }
  
  // Chat message methods
  async getAllChatMessages(): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .orderBy(chatMessages.timestamp);
  }
  
  async getChatMessageById(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.id, id));
    
    return message;
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages)
      .values({
        ...insertMessage,
        timestamp: new Date()
      })
      .returning();
    
    return message;
  }

  // User Stats and Leaderboard methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    
    return stats;
  }

  async createOrUpdateUserStats(insertStats: InsertUserStats): Promise<UserStats> {
    const existingStats = await this.getUserStats(insertStats.userId);
    
    if (existingStats) {
      // Update existing stats
      const [updated] = await db.update(userStats)
        .set({
          ...insertStats,
          updatedAt: new Date()
        })
        .where(eq(userStats.id, existingStats.id))
        .returning();
      
      return updated;
    } else {
      // Create new stats
      const [stats] = await db.insert(userStats)
        .values({
          ...insertStats,
          updatedAt: new Date()
        })
        .returning();
      
      return stats;
    }
  }

  async getTopHosts(limit: number = 10): Promise<(UserStats & { user: User })[]> {
    // Get top hosts by host rating
    const topHostStats = await db.select()
      .from(userStats)
      .orderBy(desc(userStats.hostRating), desc(userStats.sessionsHosted))
      .limit(limit);
    
    // For each stat, get the associated user
    const results: (UserStats & { user: User })[] = [];
    
    for (const stat of topHostStats) {
      const user = await this.getUser(stat.userId);
      if (user) {
        results.push({ ...stat, user });
      }
    }
    
    return results;
  }

  async getTopPlayers(limit: number = 10): Promise<(UserStats & { user: User })[]> {
    // Get top players by player rating
    const topPlayerStats = await db.select()
      .from(userStats)
      .orderBy(desc(userStats.playerRating), desc(userStats.sessionsJoined))
      .limit(limit);
    
    // For each stat, get the associated user
    const results: (UserStats & { user: User })[] = [];
    
    for (const stat of topPlayerStats) {
      const user = await this.getUser(stat.userId);
      if (user) {
        results.push({ ...stat, user });
      }
    }
    
    return results;
  }

  async createSessionReview(review: InsertSessionReview): Promise<SessionReview> {
    // Create the review
    const [newReview] = await db.insert(sessionReviews)
      .values({
        ...review,
        createdAt: new Date()
      })
      .returning();
    
    // Update the user stats based on the review
    const targetStats = await this.getUserStats(review.targetId);
    
    if (targetStats) {
      // Prepare base updates
      const updates = {
        reviewsReceived: targetStats.reviewsReceived + 1,
        updatedAt: new Date()
      };
      
      // Update the appropriate rating
      if (review.isHostReview) {
        // This is a review of a host
        const totalRating = targetStats.hostRating * targetStats.reviewsReceived + review.rating;
        const newRating = Math.round(totalRating / (targetStats.reviewsReceived + 1));
        
        await db.update(userStats)
          .set({ 
            ...updates, 
            hostRating: newRating 
          })
          .where(eq(userStats.id, targetStats.id));
      } else {
        // This is a review of a player
        const totalRating = targetStats.playerRating * targetStats.reviewsReceived + review.rating;
        const newRating = Math.round(totalRating / (targetStats.reviewsReceived + 1));
        
        await db.update(userStats)
          .set({ 
            ...updates, 
            playerRating: newRating 
          })
          .where(eq(userStats.id, targetStats.id));
      }
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
}