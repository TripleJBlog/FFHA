import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Heroes table - main character data
export const heroes = pgTable("heroes", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  class: text("class").notNull(),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  experienceToNext: integer("experience_to_next").default(100),
  skillPoints: integer("skill_points").default(0),
  
  // Core stats
  maxHealth: integer("max_health").notNull(),
  currentHealth: integer("current_health").notNull(),
  attack: integer("attack").notNull(),
  defense: integer("defense").notNull(),
  
  // Resources
  gold: integer("gold").default(100),
  honorPoints: integer("honor_points").default(0),
  arenaRank: integer("arena_rank").default(5000),
  
  // JSON fields for complex data
  skills: jsonb("skills").default({}),
  equipment: jsonb("equipment").default({}),
  inventory: jsonb("inventory").default([]),
  materials: jsonb("materials").default({}),
  craftingQueue: jsonb("crafting_queue").default([]),
  combatStats: jsonb("combat_stats").default({}),
  
  // Idle combat state
  isIdleCombating: boolean("is_idle_combating").default(false),
  lastIdleUpdate: timestamp("last_idle_update").defaultNow(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

// Equipment table for individual equipment items
export const equipment = pgTable("equipment", {
  id: text("id").primaryKey(),
  heroId: text("hero_id").references(() => heroes.id),
  name: text("name").notNull(),
  slot: text("slot").notNull(), // weapon, armor, shield, etc.
  rarity: text("rarity").notNull(), // Common, Rare, Epic, Legendary
  enhanceLevel: integer("enhance_level").default(0),
  stats: jsonb("stats").notNull(), // { attack, defense, health }
  isEquipped: boolean("is_equipped").default(false),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

// Arena battles history
export const arenaBattles = pgTable("arena_battles", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").references(() => heroes.id),
  opponentId: text("opponent_id"), // Can be null for AI opponents
  opponentName: text("opponent_name").notNull(),
  playerPowerBefore: integer("player_power_before"),
  opponentPower: integer("opponent_power"),
  victory: boolean("victory").notNull(),
  honorGained: integer("honor_gained"),
  rankChange: integer("rank_change"),
  experienceGained: integer("experience_gained"),
  battleData: jsonb("battle_data"), // Store combat log/details
  createdAt: timestamp("created_at").defaultNow(),
});

// Crafting sessions
export const craftingSessions = pgTable("crafting_sessions", {
  id: text("id").primaryKey(),
  heroId: text("hero_id").references(() => heroes.id),
  recipeId: text("recipe_id").notNull(),
  itemName: text("item_name").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  finishTime: timestamp("finish_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
  wasSkipped: boolean("was_skipped").default(false),
});

// Global game statistics
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  statKey: text("stat_key").notNull().unique(),
  statValue: integer("stat_value").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Combat logs for debugging and analytics
export const combatLogs = pgTable("combat_logs", {
  id: serial("id").primaryKey(),
  heroId: text("hero_id").references(() => heroes.id),
  logType: text("log_type").notNull(), // damage, victory, defeat, heal, levelup
  message: text("message").notNull(),
  data: jsonb("data"), // Additional structured data
  createdAt: timestamp("created_at").defaultNow(),
});

// Player sessions for offline reward calculations
export const playerSessions = pgTable("player_sessions", {
  id: serial("id").primaryKey(),
  heroId: text("hero_id").references(() => heroes.id),
  sessionStart: timestamp("session_start").defaultNow(),
  sessionEnd: timestamp("session_end"),
  offlineTimeSeconds: integer("offline_time_seconds"),
  rewardsClaimed: boolean("rewards_claimed").default(false),
  rewardsData: jsonb("rewards_data"),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Hero = {
  id: string;
  name: string;
  class: string;
  level: number;
  experience: number;
  experienceToNext: number;
  skillPoints: number;
  maxHealth: number;
  currentHealth: number;
  attack: number;
  defense: number;
  gold: number;
  honorPoints: number;
  arenaRank: number;
  skills: Record<string, number>;
  equipment: Record<string, Equipment>;
  inventory: Equipment[];
  materials: Record<string, number>;
  craftingQueue: CraftingItem[];
  combatStats: {
    totalIdleTime: number;
    enemiesDefeated: number;
    totalExperience: number;
    totalGold: number;
  };
  isIdleCombating: boolean;
  lastIdleUpdate: number;
  createdAt: number;
  lastActive: number;
};

export type Equipment = {
  id: string;
  name: string;
  slot: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  enhanceLevel: number;
  stats: {
    attack: number;
    defense: number;
    health: number;
  };
  acquiredAt: number;
};

export type CraftingItem = {
  id: string;
  recipeId: string;
  itemName: string;
  startedAt: number;
  finishTime: number;
};

export type ArenaBattle = typeof arenaBattles.$inferSelect;
export type InsertArenaBattle = typeof arenaBattles.$inferInsert;

export type CraftingSession = typeof craftingSessions.$inferSelect;
export type InsertCraftingSession = typeof craftingSessions.$inferInsert;

export type CombatLog = typeof combatLogs.$inferSelect;
export type InsertCombatLog = typeof combatLogs.$inferInsert;

export type PlayerSession = typeof playerSessions.$inferSelect;
export type InsertPlayerSession = typeof playerSessions.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const createHeroSchema = z.object({
  name: z.string().min(1).max(20),
  class: z.enum(["Warrior", "Guardian", "Mage"]),
});

export const equipmentSchema = z.object({
  name: z.string(),
  slot: z.string(),
  rarity: z.enum(["Common", "Rare", "Epic", "Legendary"]),
  enhanceLevel: z.number().min(0).max(10),
  stats: z.object({
    attack: z.number().min(0),
    defense: z.number().min(0),
    health: z.number().min(0),
  }),
});

export const battleResultSchema = z.object({
  victory: z.boolean(),
  honorGained: z.number(),
  rankChange: z.number(),
  experienceGained: z.number(),
});

export const offlineRewardsSchema = z.object({
  offlineTime: z.number().min(0),
  gold: z.number().min(0),
  experience: z.number().min(0),
  materials: z.record(z.string(), z.number().min(0)),
});
