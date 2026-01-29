import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * جدول المفاتيح - يحتوي على مفاتيح الوصول للأدمن والمستخدمين
 */
export const keys = mysqlTable("keys", {
  id: int("id").autoincrement().primaryKey(),
  keyCode: varchar("keyCode", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  maxBots: int("maxBots").notNull().default(1),
  expiryDate: timestamp("expiryDate").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  isAdmin: boolean("isAdmin").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Key = typeof keys.$inferSelect;
export type InsertKey = typeof keys.$inferInsert;

/**
 * جدول البوتات - يحتوي على معلومات جميع البوتات المُنشأة
 */
export const bots = mysqlTable("bots", {
  id: int("id").autoincrement().primaryKey(),
  keyId: int("keyId").notNull(),
  botName: varchar("botName", { length: 255 }).notNull(),
  adminUid: varchar("adminUid", { length: 255 }).notNull(),
  adminName: varchar("adminName", { length: 255 }).notNull(),
  accountUid: varchar("accountUid", { length: 255 }).notNull(),
  accountPassword: varchar("accountPassword", { length: 255 }).notNull(),
  devName: varchar("devName", { length: 255 }).notNull().default("AlliFF"),
  telegramUsername: varchar("telegramUsername", { length: 255 }),
  instagramUsername: varchar("instagramUsername", { length: 255 }),
  tiktokUsername: varchar("tiktokUsername", { length: 255 }),
  welcomeMessage: text("welcomeMessage"),
  helpMessage: text("helpMessage"),
  status: mysqlEnum("status", ["running", "stopped"]).notNull().default("stopped"),
  processId: varchar("processId", { length: 255 }),
  botDirectory: varchar("botDirectory", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bot = typeof bots.$inferSelect;
export type InsertBot = typeof bots.$inferInsert;

/**
 * جدول الإحصائيات - يحتوي على إحصائيات عامة للمنصة
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  totalBotsCreated: int("totalBotsCreated").notNull().default(0),
  activeBotsCount: int("activeBotsCount").notNull().default(0),
  totalUsers: int("totalUsers").notNull().default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = typeof statistics.$inferInsert;

/**
 * جدول سجل العمليات - يسجل جميع العمليات على النظام
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  keyId: int("keyId"),
  botId: int("botId"),
  action: varchar("action", { length: 100 }).notNull(), // create_bot, update_bot, delete_bot, create_key, update_key, delete_key
  actionType: mysqlEnum("actionType", ["create", "update", "delete", "start", "stop"]).notNull(),
  description: text("description"),
  details: text("details"), // JSON string with additional details
  status: mysqlEnum("status", ["success", "failed"]).notNull().default("success"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * جدول الإشعارات - يحتوي على الإشعارات للمستخدمين
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  keyId: int("keyId").notNull(),
  botId: int("botId"),
  type: mysqlEnum("type", ["bot_stopped", "key_expiring", "key_expired", "bot_error", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Core user table backing auth flow.
 * Extended for bot manager functionality.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
