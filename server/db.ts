import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, keys, bots, statistics, InsertKey, InsertBot, Key, Bot, activityLogs, notifications, ActivityLog, Notification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const dbUrl = ENV.databaseUrl || process.env.DATABASE_URL;
  if (!_db && dbUrl) {
    try {
      _db = drizzle(dbUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Keys Management ====================

/**
 * التحقق من صلاحية المفتاح
 */
export async function validateKey(keyCode: string, password: string) {
  // بيانات الآدمن الثابتة
  if (keyCode === "AlliFFBOT123123" && password === "admin123") {
    return {
      id: 0, // معرف افتراضي للآدمن الثابت
      keyCode: "AlliFFBOT123123",
      password: "admin123",
      isAdmin: true,
      maxBots: 999,
      expiryDate: new Date("2099-12-31"),
      isActive: true,
      createdAt: new Date(),
    } as Key;
  }

  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(keys)
    .where(
      and(
        eq(keys.keyCode, keyCode),
        eq(keys.password, password),
        eq(keys.isActive, true)
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  const key = result[0];
  
  // التحقق من تاريخ الانتهاء
  if (new Date(key.expiryDate) < new Date()) {
    return null;
  }

  return key;
}

/**
 * إنشاء مفتاح جديد
 */
export async function createKey(keyData: InsertKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(keys).values(keyData);
  return result;
}

/**
 * الحصول على جميع المفاتيح
 */
export async function getAllKeys() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(keys).orderBy(desc(keys.createdAt));
}

/**
 * الحصول على مفتاح بواسطة ID
 */
export async function getKeyById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(keys).where(eq(keys.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * تحديث مفتاح
 */
export async function updateKey(id: number, data: Partial<Key>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(keys).set(data).where(eq(keys.id, id));
}

/**
 * حذف مفتاح
 */
export async function deleteKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(keys).where(eq(keys.id, id));
}

// ==================== Bots Management ====================

/**
 * إنشاء بوت جديد
 */
export async function createBot(botData: InsertBot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bots).values(botData);
  return result;
}

/**
 * الحصول على جميع البوتات
 */
export async function getAllBots() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bots).orderBy(desc(bots.createdAt));
}

/**
 * الحصول على بوتات مستخدم معين (بواسطة keyId)
 */
export async function getBotsByKeyId(keyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bots).where(eq(bots.keyId, keyId)).orderBy(desc(bots.createdAt));
}

/**
 * عد بوتات مستخدم معين
 */
export async function countBotsByKeyId(keyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(bots)
    .where(eq(bots.keyId, keyId));

  return result[0]?.count ?? 0;
}

/**
 * الحصول على بوت بواسطة ID
 */
export async function getBotById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(bots).where(eq(bots.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * تحديث بوت
 */
export async function updateBot(id: number, data: Partial<Bot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(bots).set(data).where(eq(bots.id, id));
}

/**
 * حذف بوت
 */
export async function deleteBot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(bots).where(eq(bots.id, id));
}

// ==================== Statistics ====================

/**
 * الحصول على الإحصائيات
 */
export async function getStatistics() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(statistics).limit(1);
  
  if (result.length === 0) {
    // إنشاء سجل إحصائيات جديد إذا لم يكن موجوداً
    await db.insert(statistics).values({
      totalBotsCreated: 0,
      activeBotsCount: 0,
      totalUsers: 0,
    });
    return {
      id: 1,
      totalBotsCreated: 0,
      activeBotsCount: 0,
      totalUsers: 0,
      lastUpdated: new Date(),
    };
  }

  return result[0];
}

/**
 * تحديث الإحصائيات
 */
export async function updateStatistics() {
  const db = await getDb();
  if (!db) return;

  const totalBots = await db.select({ count: sql<number>`count(*)` }).from(bots);
  const activeBots = await db.select({ count: sql<number>`count(*)` }).from(bots).where(eq(bots.status, "running"));
  const totalKeys = await db.select({ count: sql<number>`count(*)` }).from(keys).where(eq(keys.isAdmin, false));

  const stats = await getStatistics();
  if (stats) {
    await db.update(statistics).set({
      totalBotsCreated: totalBots[0]?.count ?? 0,
      activeBotsCount: activeBots[0]?.count ?? 0,
      totalUsers: totalKeys[0]?.count ?? 0,
    }).where(eq(statistics.id, stats.id));
  }
}


// ==================== Activity Logs ====================

/**
 * تسجيل عملية جديدة
 */
export async function logActivity(data: {
  keyId?: number;
  botId?: number;
  action: string;
  actionType: "create" | "update" | "delete" | "start" | "stop";
  description?: string;
  details?: Record<string, any>;
  status?: "success" | "failed";
}) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(activityLogs).values({
    keyId: data.keyId,
    botId: data.botId,
    action: data.action,
    actionType: data.actionType,
    description: data.description,
    details: data.details ? JSON.stringify(data.details) : null,
    status: data.status ?? "success",
  });
}

/**
 * الحصول على سجل العمليات
 */
export async function getActivityLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

/**
 * الحصول على سجل عمليات مستخدم معين
 */
export async function getActivityLogsByKeyId(keyId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLogs).where(eq(activityLogs.keyId, keyId)).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ==================== Notifications ====================

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(data: {
  keyId: number;
  botId?: number;
  type: "bot_stopped" | "key_expiring" | "key_expired" | "bot_error" | "system";
  title: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(notifications).values({
    keyId: data.keyId,
    botId: data.botId,
    type: data.type,
    title: data.title,
    message: data.message,
    isRead: false,
  });
}

/**
 * الحصول على إشعارات مستخدم معين
 */
export async function getNotificationsByKeyId(keyId: number, onlyUnread: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(notifications).where(eq(notifications.keyId, keyId));
  
  if (onlyUnread) {
    query = db.select().from(notifications).where(
      and(eq(notifications.keyId, keyId), eq(notifications.isRead, false))
    );
  }

  return await query.orderBy(desc(notifications.createdAt));
}

/**
 * تحديد إشعار كمقروء
 */
export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db.update(notifications).set({
    isRead: true,
    readAt: new Date(),
  }).where(eq(notifications.id, notificationId));
}

/**
 * حذف إشعار
 */
export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db.delete(notifications).where(eq(notifications.id, notificationId));
}
