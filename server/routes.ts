import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { gameLogic } from "./gameLogic";

// Validation schemas
const createHeroSchema = z.object({
  name: z.string().min(1).max(20),
  heroClass: z.string().min(1),
});

const battleSchema = z.object({
  playerId: z.string(),
  opponentId: z.string(),
});

const craftItemSchema = z.object({
  recipeId: z.string(),
  playerId: z.string(),
});

const enhanceEquipmentSchema = z.object({
  equipmentId: z.string(),
  playerId: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Hero Management Routes
  app.post("/api/heroes", async (req, res) => {
    try {
      const { name, heroClass } = createHeroSchema.parse(req.body);
      
      const hero = await gameLogic.createHero(name, heroClass);
      res.json({ success: true, hero });
    } catch (error) {
      console.error("Create hero error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create hero" 
      });
    }
  });

  app.get("/api/heroes/:heroId", async (req, res) => {
    try {
      const { heroId } = req.params;
      const hero = await storage.getHero(heroId);
      
      if (!hero) {
        return res.status(404).json({ success: false, error: "Hero not found" });
      }
      
      res.json({ success: true, hero });
    } catch (error) {
      console.error("Get hero error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve hero" 
      });
    }
  });

  app.put("/api/heroes/:heroId", async (req, res) => {
    try {
      const { heroId } = req.params;
      const updates = req.body;
      
      const hero = await storage.updateHero(heroId, updates);
      if (!hero) {
        return res.status(404).json({ success: false, error: "Hero not found" });
      }
      
      res.json({ success: true, hero });
    } catch (error) {
      console.error("Update hero error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update hero" 
      });
    }
  });

  // Combat Routes
  app.post("/api/combat/idle/start", async (req, res) => {
    try {
      const { heroId } = req.body;
      const result = await gameLogic.startIdleCombat(heroId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Start idle combat error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to start idle combat" 
      });
    }
  });

  app.post("/api/combat/idle/stop", async (req, res) => {
    try {
      const { heroId } = req.body;
      const result = await gameLogic.stopIdleCombat(heroId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Stop idle combat error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to stop idle combat" 
      });
    }
  });

  app.post("/api/combat/idle/collect", async (req, res) => {
    try {
      const { heroId } = req.body;
      const rewards = await gameLogic.collectIdleRewards(heroId);
      res.json({ success: true, rewards });
    } catch (error) {
      console.error("Collect idle rewards error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to collect rewards" 
      });
    }
  });

  // Arena Routes
  app.get("/api/arena/opponent/:heroId", async (req, res) => {
    try {
      const { heroId } = req.params;
      const opponent = await gameLogic.findArenaOpponent(heroId);
      res.json({ success: true, opponent });
    } catch (error) {
      console.error("Find opponent error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to find opponent" 
      });
    }
  });

  app.post("/api/arena/battle", async (req, res) => {
    try {
      const { playerId, opponentId } = battleSchema.parse(req.body);
      const result = await gameLogic.simulateArenaBattle(playerId, opponentId);
      res.json({ success: true, result });
    } catch (error) {
      console.error("Arena battle error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Battle failed" 
      });
    }
  });

  app.get("/api/arena/leaderboard", async (req, res) => {
    try {
      const leaderboard = await gameLogic.getArenaLeaderboard();
      res.json({ success: true, leaderboard });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get leaderboard" 
      });
    }
  });

  // Equipment Routes
  app.post("/api/equipment/craft", async (req, res) => {
    try {
      const { recipeId, playerId } = craftItemSchema.parse(req.body);
      const result = await gameLogic.craftEquipment(playerId, recipeId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Craft equipment error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Crafting failed" 
      });
    }
  });

  app.post("/api/equipment/enhance", async (req, res) => {
    try {
      const { equipmentId, playerId } = enhanceEquipmentSchema.parse(req.body);
      const result = await gameLogic.enhanceEquipment(playerId, equipmentId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Enhance equipment error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Enhancement failed" 
      });
    }
  });

  app.post("/api/equipment/equip", async (req, res) => {
    try {
      const { equipmentId, heroId } = req.body;
      const result = await gameLogic.equipItem(heroId, equipmentId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Equip item error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to equip item" 
      });
    }
  });

  // Workshop Routes
  app.get("/api/workshop/materials/:heroId", async (req, res) => {
    try {
      const { heroId } = req.params;
      const materials = await storage.getPlayerMaterials(heroId);
      res.json({ success: true, materials });
    } catch (error) {
      console.error("Get materials error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get materials" 
      });
    }
  });

  app.post("/api/workshop/craft/start", async (req, res) => {
    try {
      const { heroId, recipeId } = req.body;
      const result = await gameLogic.startCrafting(heroId, recipeId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Start crafting error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to start crafting" 
      });
    }
  });

  app.post("/api/workshop/craft/finish", async (req, res) => {
    try {
      const { heroId, craftingId } = req.body;
      const result = await gameLogic.finishCrafting(heroId, craftingId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Finish crafting error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to finish crafting" 
      });
    }
  });

  app.post("/api/workshop/craft/skip", async (req, res) => {
    try {
      const { heroId, craftingId } = req.body;
      const result = await gameLogic.skipCrafting(heroId, craftingId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Skip crafting error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to skip crafting" 
      });
    }
  });

  // Honor Shop Routes
  app.post("/api/shop/honor/buy", async (req, res) => {
    try {
      const { heroId, itemId } = req.body;
      const result = await gameLogic.buyHonorShopItem(heroId, itemId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Buy honor shop item error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Purchase failed" 
      });
    }
  });

  // Offline Rewards Routes
  app.post("/api/offline/calculate", async (req, res) => {
    try {
      const { heroId, lastActiveTime } = req.body;
      const rewards = await gameLogic.calculateOfflineRewards(heroId, lastActiveTime);
      res.json({ success: true, rewards });
    } catch (error) {
      console.error("Calculate offline rewards error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to calculate offline rewards" 
      });
    }
  });

  app.post("/api/offline/claim", async (req, res) => {
    try {
      const { heroId, rewards, useAdBonus } = req.body;
      const result = await gameLogic.claimOfflineRewards(heroId, rewards, useAdBonus);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Claim offline rewards error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to claim offline rewards" 
      });
    }
  });

  // Game Statistics Routes
  app.get("/api/stats/global", async (req, res) => {
    try {
      const stats = await gameLogic.getGlobalStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Get global stats error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get global statistics" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    res.json({ 
      success: true, 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0" 
    });
  });

  // Error handling middleware
  app.use((error: any, req: any, res: any, next: any) => {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
