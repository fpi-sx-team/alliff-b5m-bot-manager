import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as db from "./db";

const BOTS_DIR = path.join(process.cwd(), "running_bots");
const BOT_SOURCE_DIR = path.join(process.cwd(), "bot_source");

// Store running bot processes
const runningBots = new Map<number, ChildProcess>();

/**
 * Initialize bots directory
 */
export function initializeBotsDirectory() {
    if (!fs.existsSync(BOTS_DIR)) {
          fs.mkdirSync(BOTS_DIR, { recursive: true });
    }
}

/**
 * Copy bot source code and replace variables
 */
function prepareBotDirectory(botId: number, botData: any): string {
    const botDir = path.join(BOTS_DIR, `bot_${botId}`);

  // Create bot directory
  if (!fs.existsSync(botDir)) {
        fs.mkdirSync(botDir, { recursive: true });
  }

  // Copy all source files
  copyDirectory(BOT_SOURCE_DIR, botDir);

  // Read main.py
  const mainPyPath = path.join(botDir, "main.py");
    let mainPyContent = fs.readFileSync(mainPyPath, "utf-8");

  // Replace variables
  mainPyContent = mainPyContent.replace(/{ADMIN_UID}/g, botData.adminUid);
    mainPyContent = mainPyContent.replace(/ {uid}/g, ` ${botData.accountUid}`);
    mainPyContent = mainPyContent.replace(/ {pass}/g, ` ${botData.accountPassword}`);

  // Replace developer info in welcome messages
  const devName = botData.devName || "AlliFF";
    const telegramUser = botData.telegramUsername || "@AlliFF_BOT";
    const instaUser = botData.instagramUsername || "";
    const tiktokUser = botData.tiktokUsername || "";

  mainPyContent = mainPyContent.replace(/dev_name = ".*?"/g, `dev_name = "${devName}"`);
    mainPyContent = mainPyContent.replace(/owner_user = ".*?"/g, `owner_user = "${telegramUser}"`);
    mainPyContent = mainPyContent.replace(/insta = ".*?"/g, `insta = "${instaUser}"`);
    mainPyContent = mainPyContent.replace(/tok = ".*?"/g, `tok = "${tiktokUser}"`);

  // Add these variables if they don't exist
  if (!mainPyContent.includes("dev_name =")) {
        mainPyContent = `dev_name = "${devName}"\nowner_user = "${telegramUser}"\ninsta = "${instaUser}"\ntok = "${tiktokUser}"\n\n` + mainPyContent;
  }

  // Write modified main.py
  fs.writeFileSync(mainPyPath, mainPyContent);

  return botDir;
}

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string) {
    if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
    }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
        const srcPath
