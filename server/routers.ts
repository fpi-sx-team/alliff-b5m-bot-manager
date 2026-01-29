import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import * as botManager from "./botManager";

// Custom authentication procedure for key-based auth
const keyAuthProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const keyId = ctx.req.headers["x-key-id"];
  
  if (!keyId || typeof keyId !== "string") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No key provided" });
  }

  const key = await db.getKeyById(parseInt(keyId));
  
  if (!key) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid key" });
  }

  // Check if key is expired
  if (new Date(key.expiryDate) < new Date()) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Key expired" });
  }

  if (!key.isActive) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Key is inactive" });
  }

  return next({
    ctx: {
      ...ctx,
      key,
    },
  });
});

// Admin-only procedure
const adminProcedure = keyAuthProcedure.use(async ({ ctx, next }) => {
  if (!ctx.key.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }

  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Key-based login
    login: publicProcedure
      .input(z.object({
        keyCode: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const key = await db.validateKey(input.keyCode, input.password);
        
        if (!key) {
          throw new TRPCError({ 
            code: "UNAUTHORIZED", 
            message: "Invalid key or password" 
          });
        }

        return {
          success: true,
          key: {
            id: key.id,
            keyCode: key.keyCode,
            isAdmin: key.isAdmin,
            maxBots: key.maxBots,
            expiryDate: key.expiryDate,
          },
        };
      }),
  }),

  // Keys management (Admin only)
  keys: router({
    list: adminProcedure.query(async () => {
      return await db.getAllKeys();
    }),

    create: adminProcedure
      .input(z.object({
        keyCode: z.string().min(1),
        password: z.string().min(1),
        maxBots: z.number().min(1),
        expiryDate: z.date(),
        isAdmin: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        await db.createKey({
          keyCode: input.keyCode,
          password: input.password,
          maxBots: input.maxBots,
          expiryDate: input.expiryDate,
          isAdmin: input.isAdmin,
          isActive: true,
        });

        await db.updateStatistics();

        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        maxBots: z.number().optional(),
        expiryDate: z.date().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateKey(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Check if key has bots
        const bots = await db.getBotsByKeyId(input.id);
        if (bots.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete key with active bots",
          });
        }

        await db.deleteKey(input.id);
        await db.updateStatistics();
        return { success: true };
      }),
  }),

  // Bots management
  bots: router({
    list: keyAuthProcedure.query(async ({ ctx }) => {
      if (ctx.key.isAdmin) {
        return await db.getAllBots();
      }
      return await db.getBotsByKeyId(ctx.key.id);
    }),

    getById: keyAuthProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const bot = await db.getBotById(input.id);
        
        if (!bot) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bot not found" });
        }

        // Check ownership
        if (!ctx.key.isAdmin && bot.keyId !== ctx.key.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        return bot;
      }),

    create: keyAuthProcedure
      .input(z.object({
        botName: z.string().min(1),
        adminUid: z.string().min(1),
        adminName: z.string().min(1),
        accountUid: z.string().min(1),
        accountPassword: z.string().min(1),
        telegramUsername: z.string().optional(),
        instagramUsername: z.string().optional(),
        tiktokUsername: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check bot limit
        const currentCount = await db.countBotsByKeyId(ctx.key.id);
        
        if (currentCount >= ctx.key.maxBots) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Maximum bot limit reached",
          });
        }

        await db.createBot({
          keyId: ctx.key.id,
          botName: input.botName,
          adminUid: input.adminUid,
          adminName: input.adminName,
          accountUid: input.accountUid,
          accountPassword: input.accountPassword,
          devName: "AlliFF",
          telegramUsername: input.telegramUsername || null,
          instagramUsername: input.instagramUsername || null,
          tiktokUsername: input.tiktokUsername || null,
          status: "stopped",
        });

        await db.updateStatistics();

        return { success: true };
      }),

    update: keyAuthProcedure
      .input(z.object({
        id: z.number(),
        botName: z.string().optional(),
        adminUid: z.string().optional(),
        adminName: z.string().optional(),
        accountUid: z.string().optional(),
        accountPassword: z.string().optional(),
        telegramUsername: z.string().optional(),
        instagramUsername: z.string().optional(),
        tiktokUsername: z.string().optional(),
        welcomeMessage: z.string().optional(),
        helpMessage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const bot = await db.getBotById(input.id);
        
        if (!bot) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bot not found" });
        }

        // Check ownership
        if (!ctx.key.isAdmin && bot.keyId !== ctx.key.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const { id, ...data } = input;
        await db.updateBot(id, data);

        return { success: true };
      }),

    delete: keyAuthProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const bot = await db.getBotById(input.id);
        
        if (!bot) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bot not found" });
        }

        // Check ownership
        if (!ctx.key.isAdmin && bot.keyId !== ctx.key.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const deleted = await botManager.deleteBot(input.id);
        
        if (!deleted) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete bot",
          });
        }

        return { success: true };
      }),

    start: keyAuthProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const bot = await db.getBotById(input.id);
        
        if (!bot) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bot not found" });
        }

        // Check ownership
        if (!ctx.key.isAdmin && bot.keyId !== ctx.key.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const started = await botManager.startBot(input.id);
        
        if (!started) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to start bot",
          });
        }

        return { success: true };
      }),

    stop: keyAuthProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const bot = await db.getBotById(input.id);
        
        if (!bot) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bot not found" });
        }

        // Check ownership
        if (!ctx.key.isAdmin && bot.keyId !== ctx.key.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const stopped = await botManager.stopBot(input.id);
        
        if (!stopped) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to stop bot",
          });
        }

        return { success: true };
      }),
  }),

  // Statistics
  statistics: router({
    get: keyAuthProcedure.query(async ({ ctx }) => {
      const stats = await db.getStatistics();
      
      if (ctx.key.isAdmin) {
        return stats;
      }

      // For non-admin users, return limited stats
      const userBots = await db.getBotsByKeyId(ctx.key.id);
      return {
        totalBotsCreated: stats?.totalBotsCreated || 0,
        userBotsCount: userBots.length,
        userBotsLimit: ctx.key.maxBots,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
