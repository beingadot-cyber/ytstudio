import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  real,
  boolean,
  timestamp,
  date,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 150 }).notNull(),
  avatarUrl: text("avatar_url"),
  channelName: varchar("channel_name", { length: 150 }).notNull().default("Creator Studio"),
  channelDescription: text("channel_description"),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  theme: varchar("theme", { length: 20 }).notNull().default("dark"),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Video Analytics (aggregate)
export const videoAnalytics = pgTable("video_analytics", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  views: bigint("views", { mode: "number" }).notNull().default(0),
  likes: bigint("likes", { mode: "number" }).notNull().default(0),
  comments: integer("comments").notNull().default(0),
  watchTime: bigint("watch_time", { mode: "number" }).notNull().default(0), // minutes
  averageViewDuration: real("average_view_duration").notNull().default(0), // seconds
  subscribersGained: integer("subscribers_gained").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Daily Analytics
export const dailyAnalytics = pgTable("daily_analytics", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  watchTime: integer("watch_time").notNull().default(0), // minutes
  revenue: real("revenue").notNull().default(0),
  subscribersGained: integer("subscribers_gained").notNull().default(0),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  author: varchar("author", { length: 150 }).notNull(),
  authorAvatar: text("author_avatar"),
  text: text("text").notNull(),
  likes: integer("likes").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  isDemo: boolean("is_demo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Revenue table
export const revenue = pgTable("revenue", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  amount: real("amount").notNull().default(0),
  source: varchar("source", { length: 50 }).notNull().default("ads"),
});

// Settings / global stats
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
