import mysql from "mysql2/promise";

async function fixAdmin() {
  console.log("Starting database fix...");
  const databaseUrl = "mysql://root@localhost:3306/manus";

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("Connected to database.");

    // التأكد من وجود الجدول
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`keys\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`keyCode\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`maxBots\` int NOT NULL DEFAULT '1',
        \`expiryDate\` timestamp NOT NULL,
        \`isActive\` tinyint(1) NOT NULL DEFAULT '1',
        \`isAdmin\` tinyint(1) NOT NULL DEFAULT '0',
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`keyCode\` (\`keyCode\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    const expiryDate = "2036-01-01 00:00:00";
    
    // حذف أي سجل قديم بنفس الاسم لضمان النظافة
    await connection.execute("DELETE FROM `keys` WHERE keyCode = 'AlliFFBOT123123'");

    // إضافة الأدمن
    await connection.execute(
      "INSERT INTO `keys` (keyCode, password, maxBots, expiryDate, isActive, isAdmin) VALUES (?, ?, ?, ?, ?, ?)",
      ["AlliFFBOT123123", "admin123", 100, expiryDate, 1, 1]
    );

    console.log("Admin account 'AlliFFBOT123123' with password 'admin123' has been inserted successfully!");
    
    // التحقق من الإضافة
    const [rows]: any = await connection.execute("SELECT * FROM `keys` WHERE keyCode = 'AlliFFBOT123123'");
    console.log("Verification check:", rows);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Failed to fix admin:", error);
    process.exit(1);
  }
}

fixAdmin();
