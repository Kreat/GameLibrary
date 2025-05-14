import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  location: text("location"),
  favoriteGames: text("favorite_games"),
  photoUrl: text("photo_url"),
  role: text("role").default("user"), // Values: "user", "admin", "moderator"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  firebaseUid: text("firebase_uid").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  bio: true,
  location: true,
  favoriteGames: true,
  photoUrl: true,
  role: true,
  firebaseUid: true,
});

// Games Table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // board, card, rpg, miniature, party
  description: text("description"),
  minPlayers: integer("min_players"),
  maxPlayers: integer("max_players"),
  complexity: text("complexity"), // low, medium, high
  playTime: text("play_time"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  title: true,
  type: true,
  description: true,
  minPlayers: true,
  maxPlayers: true,
  complexity: true,
  playTime: true,
  imageUrl: true,
});

// Sessions Table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  gameId: integer("game_id").references(() => games.id),
  gameType: text("game_type").notNull(),
  gameName: text("game_name").notNull(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  location: text("location").notNull(),
  address: text("address"),
  locationNotes: text("location_notes"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: text("duration"),
  recurring: text("recurring").default("once"), // once, weekly, biweekly, monthly
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(1),
  experienceLevel: text("experience_level").notNull(), // beginner, intermediate, advanced
  isBeginnerFriendly: boolean("is_beginner_friendly").notNull().default(false),
  hostPhotoUrl: text("host_photo_url"),
  hostName: text("host_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  hostData: json("host_data"),
  participantsData: json("participants_data"),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  title: true,
  description: true,
  gameId: true,
  gameType: true,
  gameName: true,
  hostId: true,
  location: true,
  address: true,
  locationNotes: true,
  startTime: true,
  endTime: true,
  duration: true,
  recurring: true,
  minPlayers: true,
  maxPlayers: true,
  currentPlayers: true,
  experienceLevel: true,
  hostData: true,
  participantsData: true,
});

// Session Participants Junction Table
export const sessionParticipants = pgTable("session_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isHost: boolean("is_host").default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertSessionParticipantSchema = createInsertSchema(sessionParticipants).pick({
  sessionId: true,
  userId: true,
  isHost: true,
});

// User Availability Table
export const userAvailability = pgTable("user_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  weekdayMorning: boolean("weekday_morning").default(false),
  weekdayAfternoon: boolean("weekday_afternoon").default(false),
  weekdayEvening: boolean("weekday_evening").default(false),
  weekendMorning: boolean("weekend_morning").default(false),
  weekendAfternoon: boolean("weekend_afternoon").default(false),
  weekendEvening: boolean("weekend_evening").default(false),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserAvailabilitySchema = createInsertSchema(userAvailability).pick({
  userId: true,
  weekdayMorning: true,
  weekdayAfternoon: true,
  weekdayEvening: true,
  weekendMorning: true,
  weekendAfternoon: true,
  weekendEvening: true,
  notes: true,
});

// Forum Categories Table
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  iconName: text("icon_name"),
  color: text("color"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).pick({
  name: true,
  description: true,
  slug: true,
  iconName: true,
  color: true,
});

// Forum Threads Table
export const forumThreads = pgTable("forum_threads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  categoryId: integer("category_id").references(() => forumCategories.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  views: integer("views").default(0),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastPostAt: timestamp("last_post_at").notNull().defaultNow(),
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).pick({
  title: true,
  categoryId: true,
  authorId: true,
  isPinned: true,
  isLocked: true,
  tags: true,
});

// Forum Posts Table
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => forumThreads.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  threadId: true,
  authorId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertSessionParticipant = z.infer<typeof insertSessionParticipantSchema>;
export type SessionParticipant = typeof sessionParticipants.$inferSelect;

export type InsertUserAvailability = z.infer<typeof insertUserAvailabilitySchema>;
export type UserAvailability = typeof userAvailability.$inferSelect;

export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;

export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forumThreads.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

// Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  content: text("content").notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  messageId: true,
  content: true,
  senderId: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// User Stats Table
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  sessionsHosted: integer("sessions_hosted").notNull().default(0),
  sessionsJoined: integer("sessions_joined").notNull().default(0),
  reputation: integer("reputation").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  hostRating: integer("host_rating").notNull().default(0),
  playerRating: integer("player_rating").notNull().default(0),
  reviewsReceived: integer("reviews_received").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
  sessionsHosted: true,
  sessionsJoined: true,
  reputation: true,
  gamesPlayed: true,
  hostRating: true,
  playerRating: true,
  reviewsReceived: true,
});

// Session Reviews Table
export const sessionReviews = pgTable("session_reviews", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  targetId: integer("target_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  content: text("content"),
  isHostReview: boolean("is_host_review").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionReviewSchema = createInsertSchema(sessionReviews).pick({
  sessionId: true,
  reviewerId: true,
  targetId: true,
  rating: true,
  content: true,
  isHostReview: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

export type InsertSessionReview = z.infer<typeof insertSessionReviewSchema>;
export type SessionReview = typeof sessionReviews.$inferSelect;

// Content Reports Table - For reporting inappropriate content
export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  contentType: text("content_type").notNull(), // "forum_post", "forum_thread", "chat_message", "user_profile", etc.
  contentId: integer("content_id").notNull(), // ID of the reported content
  reason: text("reason").notNull(), // Why was this content reported
  status: text("status").default("pending"), // "pending", "reviewed", "rejected", "actioned"
  actionTaken: text("action_taken"), // What action was taken by the admin
  adminId: integer("admin_id").references(() => users.id), // Admin who handled the report
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContentReportSchema = createInsertSchema(contentReports).pick({
  reporterId: true,
  contentType: true,
  contentId: true,
  reason: true,
  status: true,
  actionTaken: true,
  adminId: true,
});

export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type ContentReport = typeof contentReports.$inferSelect;
