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
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Start a bot
 */
export async function startBot(botId: number): Promise<boolean> {
  try {
    // Check if bot is already running
    if (runningBots.has(botId)) {
      console.log(`Bot ${botId} is already running`);
      return false;
    }

    // Get bot data from database
    const bot = await db.getBotById(botId);
    if (!bot) {
      console.error(`Bot ${botId} not found in database`);
      return false;
    }

    // Prepare bot directory
    const botDir = prepareBotDirectory(botId, bot);

    // Install requirements if needed
    const requirementsPath = path.join(botDir, "requirements.txt");
    if (fs.existsSync(requirementsPath)) {
      console.log(`Installing requirements for bot ${botId}...`);
      await new Promise<void>((resolve, reject) => {
        const install = spawn("pip3", ["install", "-r", requirementsPath], {
          cwd: botDir,
          stdio: "pipe",
        });

        install.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Failed to install requirements: exit code ${code}`));
          }
        });
      });
    }

    // Start bot process
    const botProcess = spawn("python3", ["main.py"], {
      cwd: botDir,
      stdio: "pipe",
      detached: false,
    });

    // Store process
    runningBots.set(botId, botProcess);

    // Update database
    await db.updateBot(botId, {
      status: "running",
      processId: botProcess.pid?.toString(),
      botDirectory: botDir,
    });

    // Handle process output
    botProcess.stdout?.on("data", (data) => {
      console.log(`[Bot ${botId}] ${data.toString()}`);
    });

    botProcess.stderr?.on("data", (data) => {
      console.error(`[Bot ${botId} Error] ${data.toString()}`);
    });

    botProcess.on("close", async (code) => {
      console.log(`Bot ${botId} exited with code ${code}`);
      runningBots.delete(botId);
      
      // Update database
      await db.updateBot(botId, {
        status: "stopped",
        processId: null,
      });
      
      await db.updateStatistics();
    });

    await db.updateStatistics();
    console.log(`Bot ${botId} started successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to start bot ${botId}:`, error);
    return false;
  }
}

/**
 * Stop a bot
 */
export async function stopBot(botId: number): Promise<boolean> {
  try {
    const botProcess = runningBots.get(botId);
    
    if (!botProcess) {
      console.log(`Bot ${botId} is not running`);
      return false;
    }

    // Kill process
    botProcess.kill("SIGTERM");
    
    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force kill if still running
    if (!botProcess.killed) {
      botProcess.kill("SIGKILL");
    }

    runningBots.delete(botId);

    // Update database
    await db.updateBot(botId, {
      status: "stopped",
      processId: null,
    });

    await db.updateStatistics();
    console.log(`Bot ${botId} stopped successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to stop bot ${botId}:`, error);
    return false;
  }
}

/**
 * Delete a bot
 */
export async function deleteBot(botId: number): Promise<boolean> {
  try {
    // Stop bot if running
    if (runningBots.has(botId)) {
      await stopBot(botId);
    }

    // Get bot data
    const bot = await db.getBotById(botId);
    if (!bot) {
      return false;
    }

    // Delete bot directory
    if (bot.botDirectory && fs.existsSync(bot.botDirectory)) {
      fs.rmSync(bot.botDirectory, { recursive: true, force: true });
    }

    // Delete from database
    await db.deleteBot(botId);
    await db.updateStatistics();

    console.log(`Bot ${botId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to delete bot ${botId}:`, error);
    return false;
  }
}

/**
 * Get bot status
 */
export function getBotStatus(botId: number): "running" | "stopped" {
  return runningBots.has(botId) ? "running" : "stopped";
}

/**
 * Cleanup on server shutdown
 */
export async function cleanup() {
  console.log("Stopping all running bots...");
  
  const botIds = Array.from(runningBots.keys());
  
  for (const botId of botIds) {
    const process = runningBots.get(botId);
    if (process) {
      try {
        process.kill("SIGTERM");
        await db.updateBot(botId, {
          status: "stopped",
          processId: null,
        });
      } catch (error) {
        console.error(`Failed to stop bot ${botId}:`, error);
      }
    }
  }
  
  runningBots.clear();
}

// Initialize on module load
initializeBotsDirectory();
