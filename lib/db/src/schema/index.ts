import { pgTable, serial, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  discordUsername: text("discord_username"),
  avatarUrl: text("avatar_url"),
  totalClaims: integer("total_claims").notNull().default(0),
  approvedClaims: integer("approved_claims").notNull().default(0),
  inviteCount: integer("invite_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  otpCode: text("otp_code"),
  otpExpiry: timestamp("otp_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
});

export const rewardsTable = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement").notNull(),
  requirementValue: integer("requirement_value"),
  rewardValue: text("reward_value").notNull(),
  categoryId: integer("category_id").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  claimCount: integer("claim_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const claimsTable = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  status: text("status").notNull().default("pending"),
  discordUsername: text("discord_username").notNull(),
  discordLink: text("discord_link"),
  email: text("email").notNull(),
  paymentMethod: text("payment_method").default("gmail"),
  paymentAmount: integer("payment_amount"),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const claimMessagesTable = pgTable("claim_messages", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  proofUrl: text("proof_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const worldChatTable = pgTable("world_chat", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  userId: integer("user_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
