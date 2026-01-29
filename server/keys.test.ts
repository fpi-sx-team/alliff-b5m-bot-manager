import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

describe("Keys Management", () => {
  let adminKeyId: number;

  beforeAll(async () => {
    // Try to get existing admin key or create one
    let adminKey = await db.validateKey("AlliFFBOT123123", "admin123");
    
    if (!adminKey) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 365);

      try {
        await db.createKey({
          keyCode: "AlliFFBOT123123",
          password: "admin123",
          maxBots: 999,
          expiryDate,
          isAdmin: true,
          isActive: true,
        });
      } catch (error) {
        // Key might already exist, that's ok
      }

      adminKey = await db.validateKey("AlliFFBOT123123", "admin123");
    }
    
    if (adminKey) {
      adminKeyId = adminKey.id;
    }
  });

  it("should validate admin key correctly", async () => {
    const key = await db.validateKey("AlliFFBOT123123", "admin123");
    
    expect(key).toBeTruthy();
    expect(key?.isAdmin).toBe(true);
    expect(key?.keyCode).toBe("AlliFFBOT123123");
  });

  it("should reject invalid key", async () => {
    const key = await db.validateKey("INVALID_KEY", "wrong_password");
    
    expect(key).toBeNull();
  });

  it("should list all keys for admin", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {
          "x-key-id": adminKeyId.toString(),
        },
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const keys = await caller.keys.list();

    expect(keys).toBeTruthy();
    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBeGreaterThan(0);
  });
});

describe("Authentication", () => {
  it("should login with valid credentials", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      keyCode: "AlliFFBOT123123",
      password: "admin123",
    });

    expect(result.success).toBe(true);
    expect(result.key).toBeTruthy();
    expect(result.key.isAdmin).toBe(true);
  });

  it("should reject invalid credentials", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        keyCode: "INVALID",
        password: "wrong",
      })
    ).rejects.toThrow();
  });
});
