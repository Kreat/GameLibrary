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
