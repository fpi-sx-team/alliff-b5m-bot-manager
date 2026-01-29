import * as db from "./server/db";
import { keys } from "./drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function setupAdmin() {
  console.log("Setting up admin account...");
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    return;
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    const dbInstance = drizzle(connection);

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10); // 10 years expiry

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

    console.log("Admin account created/updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to setup admin:", error);
    process.exit(1);
  }
}

setupAdmin();
