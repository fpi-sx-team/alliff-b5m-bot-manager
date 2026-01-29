import * as db from "./db";
import { keys } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  try {
    const connection = await mysql.createConnection(databaseUrl);
    const dbInstance = drizzle(connection);

    const expiryDate = new Date("2036-01-01");

    await dbInstance.insert(keys).values({
      keyCode: "AlliFFBOT123123",
      password: "admin123",
      maxBots: 100,
      expiryDate: expiryDate,
      isActive: true,
      isAdmin: true,
    }).onDuplicateKeyUpdate({
      set: {
        password: "admin123",
        isAdmin: true,
        isActive: true,
        maxBots: 100,
        expiryDate: expiryDate,
      }
    });

    console.log("[Seed] Default admin account ensured.");
    await connection.end();
  } catch (error) {
    console.error("[Seed] Failed to seed admin:", error);
  }
}
