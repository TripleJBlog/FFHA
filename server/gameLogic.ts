import { storage } from "./storage";
import type { Hero, Equipment, CraftingItem } from "../shared/schema";

class GameLogic {
  private readonly HERO_CLASSES = {
    Warrior: { attack: 15, defense: 10, health: 120 },
    Guardian: { attack: 10, defense: 15, health: 150 },
    Mage: { attack: 18, defense: 8, health: 100 }
  };

  private readonly EQUIPMENT_RECIPES = {
    iron_sword: {
      name: "Iron Sword",
      slot: "weapon",
      rarity: "Common",
      craftTime: 30000,
      goldCost: 100,
      materials: { ironOre: 3, wood: 1 },
      stats: { attack: 12, defense: 0, health: 0 }
    },
    leather_armor: {
      name: "Leather Armor", 
      slot: "armor",
      rarity: "Common",
      craftTime: 45000,
      goldCost: 80,
      materials: { leather: 4, cloth: 2 },
      stats: { attack: 0, defense: 8, health: 20 }
    },
    wooden_shield: {
      name: "Wooden Shield",
      slot: "shield", 
      rarity: "Common",
      craftTime: 20000,
      goldCost: 60,
      materials: { wood: 3, leather: 1 },
      stats: { attack: 0, defense: 6, health: 15 }
    }
  };

  private readonly HONOR_SHOP_ITEMS = {
    honor_sword: {
      name: "Honor Blade",
      type: "equipment",
      slot: "weapon",
      rarity: "Legendary",
      cost: 500,
      stats: { attack: 50, defense: 8, health: 20 }
    },
    honor_armor: {
      name: "Champion's Plate",
      type: "equipment", 
      slot: "armor",
      rarity: "Legendary",
      cost: 750,
      stats: { attack: 8, defense: 40, health: 100 }
    }
  };

  async createHero(name: string, heroClass: string): Promise<Hero> {
    const classStats = this.HERO_CLASSES[heroClass as keyof typeof this.HERO_CLASSES];
    if (!classStats) {
      throw new Error("Invalid hero class");
    }

    const hero: Hero = {
      id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      class: heroClass,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      skillPoints: 0,
      maxHealth: classStats.health,
      currentHealth: classStats.health,
      attack: classStats.attack,
      defense: classStats.defense,
      gold: 100,
      honorPoints: 0,
      arenaRank: 5000,
      skills: {},
      equipment: {},
      inventory: [],
      materials: {
        ironOre: 10,
        leather: 8,
        cloth: 5,
        wood: 12,
        crystals: 2,
        gems: 1
      },
      craftingQueue: [],
      combatStats: {
        totalIdleTime: 0,
        enemiesDefeated: 0,
        totalExperience: 0,
        totalGold: 0
      },
      isIdleCombating: false,
      lastIdleUpdate: Date.now(),
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    return await storage.createHero(hero);
  }

  async startIdleCombat(heroId: string): Promise<{ enemy: any }> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    if (hero.isIdleCombating) {
      throw new Error("Hero is already in idle combat");
    }

    // Generate enemy based on hero level
    const enemy = this.generateEnemy(hero.level);
    
    await storage.updateHero(heroId, {
      isIdleCombating: true,
      lastIdleUpdate: Date.now()
    });

    return { enemy };
  }

  async stopIdleCombat(heroId: string): Promise<{ message: string }> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    await storage.updateHero(heroId, {
      isIdleCombating: false
    });

    return { message: "Idle combat stopped" };
  }

  async collectIdleRewards(heroId: string): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    // In a real implementation, you would calculate rewards based on time elapsed
    // For now, we'll return some mock rewards
    const rewards = {
      gold: Math.floor(Math.random() * 50) + 10,
      experience: Math.floor(Math.random() * 30) + 20,
      materials: {}
    };

    // Apply rewards to hero
    const updatedHero = {
      ...hero,
      gold: hero.gold + rewards.gold,
      experience: hero.experience + rewards.experience
    };

    // Check for level up
    if (updatedHero.experience >= updatedHero.experienceToNext) {
      updatedHero.level += 1;
      updatedHero.experience -= updatedHero.experienceToNext;
      updatedHero.experienceToNext = updatedHero.level * 100;
      updatedHero.skillPoints += 1;
      
      // Increase stats on level up
      updatedHero.attack += 3;
      updatedHero.defense += 2;
      updatedHero.maxHealth += 10;
      updatedHero.currentHealth = updatedHero.maxHealth; // Full heal on level up
    }

    await storage.updateHero(heroId, updatedHero);
    return rewards;
  }

  async findArenaOpponent(heroId: string): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    // Generate a random opponent near the player's rank
    const rankVariance = Math.floor(hero.arenaRank * 0.1) || 100;
    const opponentRank = Math.max(1, hero.arenaRank + (Math.random() - 0.5) * rankVariance * 2);
    const opponentLevel = Math.max(1, hero.level + Math.floor((Math.random() - 0.5) * 4));

    const opponentNames = [
      "Shadow Warrior", "Iron Knight", "Flame Mage", "Storm Guardian",
      "Crystal Hunter", "Dark Paladin", "Wind Assassin", "Earth Shaman"
    ];

    const opponent = {
      id: `opponent_${Date.now()}`,
      name: opponentNames[Math.floor(Math.random() * opponentNames.length)],
      level: opponentLevel,
      rank: Math.floor(opponentRank),
      attack: 10 + opponentLevel * 2,
      defense: 8 + opponentLevel * 1.5,
      health: 100 + opponentLevel * 10
    };

    return opponent;
  }

  async simulateArenaBattle(playerId: string, opponentId: string): Promise<any> {
    const hero = await storage.getHero(playerId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    // In a real implementation, you would load the actual opponent
    // For now, we'll simulate the battle result
    const playerPower = hero.attack + hero.defense + hero.maxHealth / 10;
    const opponentPower = 150 + Math.random() * 100; // Mock opponent power

    const victory = playerPower > opponentPower * (0.8 + Math.random() * 0.4);
    
    const honorGained = victory ? 15 + Math.floor(Math.random() * 10) : -5;
    const rankChange = victory ? -Math.floor(Math.random() * 10) - 1 : Math.floor(Math.random() * 5) + 1;
    const experienceGained = victory ? 50 + hero.level * 3 : 20 + hero.level;

    // Update hero
    await storage.updateHero(playerId, {
      honorPoints: Math.max(0, hero.honorPoints + honorGained),
      arenaRank: Math.max(1, hero.arenaRank + rankChange),
      experience: hero.experience + experienceGained
    });

    return {
      victory,
      honorGained,
      rankChange,
      experienceGained
    };
  }

  async getArenaLeaderboard(): Promise<any[]> {
    // In a real implementation, this would query the database
    // For now, return mock leaderboard data
    return [
      { id: "1", name: "DragonSlayer", level: 25, rank: 1, honor: 1500 },
      { id: "2", name: "ShadowMaster", level: 23, rank: 2, honor: 1450 },
      { id: "3", name: "IronLord", level: 22, rank: 3, honor: 1400 }
    ];
  }

  async craftEquipment(playerId: string, recipeId: string): Promise<any> {
    const hero = await storage.getHero(playerId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const recipe = this.EQUIPMENT_RECIPES[recipeId as keyof typeof this.EQUIPMENT_RECIPES];
    if (!recipe) {
      throw new Error("Invalid recipe");
    }

    // Check if player has enough gold
    if (hero.gold < recipe.goldCost) {
      throw new Error("Insufficient gold");
    }

    // Check if player has enough materials
    for (const [material, amount] of Object.entries(recipe.materials)) {
      if ((hero.materials[material] || 0) < amount) {
        throw new Error(`Insufficient ${material}`);
      }
    }

    // Deduct costs
    const updatedMaterials = { ...hero.materials };
    for (const [material, amount] of Object.entries(recipe.materials)) {
      updatedMaterials[material] -= amount;
    }

    const craftingItem: CraftingItem = {
      id: `craft_${Date.now()}`,
      recipeId,
      itemName: recipe.name,
      finishTime: Date.now() + recipe.craftTime,
      startedAt: Date.now()
    };

    await storage.updateHero(playerId, {
      gold: hero.gold - recipe.goldCost,
      materials: updatedMaterials,
      craftingQueue: [...hero.craftingQueue, craftingItem]
    });

    return { craftingItem };
  }

  async finishCrafting(heroId: string, craftingId: string): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const craftingItem = hero.craftingQueue.find(item => item.id === craftingId);
    if (!craftingItem) {
      throw new Error("Crafting item not found");
    }

    if (craftingItem.finishTime > Date.now()) {
      throw new Error("Crafting not yet finished");
    }

    const recipe = this.EQUIPMENT_RECIPES[craftingItem.recipeId as keyof typeof this.EQUIPMENT_RECIPES];
    if (!recipe) {
      throw new Error("Invalid recipe");
    }

    // Create new equipment
    const equipment: Equipment = {
      id: `eq_${Date.now()}`,
      name: recipe.name,
      slot: recipe.slot,
      rarity: recipe.rarity as any,
      enhanceLevel: 0,
      stats: recipe.stats,
      acquiredAt: Date.now()
    };

    // Update hero
    await storage.updateHero(heroId, {
      inventory: [...hero.inventory, equipment],
      craftingQueue: hero.craftingQueue.filter(item => item.id !== craftingId)
    });

    return { equipment };
  }

  async skipCrafting(heroId: string, craftingId: string): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const craftingItem = hero.craftingQueue.find(item => item.id === craftingId);
    if (!craftingItem) {
      throw new Error("Crafting item not found");
    }

    const timeRemaining = Math.max(0, craftingItem.finishTime - Date.now());
    const skipCost = Math.ceil(timeRemaining / 1000) * 10; // 10 gold per second

    if (hero.gold < skipCost) {
      throw new Error("Insufficient gold to skip");
    }

    // Update crafting item to finish now
    const updatedQueue = hero.craftingQueue.map(item =>
      item.id === craftingId
        ? { ...item, finishTime: Date.now() }
        : item
    );

    await storage.updateHero(heroId, {
      gold: hero.gold - skipCost,
      craftingQueue: updatedQueue
    });

    return { skipCost };
  }

  async enhanceEquipment(playerId: string, equipmentId: string): Promise<any> {
    const hero = await storage.getHero(playerId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    // Find equipment in inventory or equipped items
    let equipment = hero.inventory.find(eq => eq.id === equipmentId);
    let isEquipped = false;

    if (!equipment) {
      equipment = Object.values(hero.equipment).find(eq => eq?.id === equipmentId);
      isEquipped = true;
    }

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    if (equipment.enhanceLevel >= 10) {
      throw new Error("Equipment already at maximum enhancement level");
    }

    const enhanceCost = (equipment.enhanceLevel + 1) * 100;
    if (hero.gold < enhanceCost) {
      throw new Error("Insufficient gold for enhancement");
    }

    // Enhance the equipment
    const enhancedEquipment = {
      ...equipment,
      enhanceLevel: equipment.enhanceLevel + 1,
      stats: {
        attack: equipment.stats.attack + 2,
        defense: equipment.stats.defense + 2,
        health: equipment.stats.health + 5
      }
    };

    // Update hero data
    let updatedHero: any = {
      gold: hero.gold - enhanceCost
    };

    if (isEquipped) {
      updatedHero.equipment = {
        ...hero.equipment,
        [equipment.slot]: enhancedEquipment
      };
    } else {
      updatedHero.inventory = hero.inventory.map(eq =>
        eq.id === equipmentId ? enhancedEquipment : eq
      );
    }

    await storage.updateHero(playerId, updatedHero);
    return { equipment: enhancedEquipment, cost: enhanceCost };
  }

  async equipItem(heroId: string, equipmentId: string): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const equipment = hero.inventory.find(eq => eq.id === equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found in inventory");
    }

    // Unequip current item in slot if exists
    const currentEquipped = hero.equipment[equipment.slot];
    let updatedInventory = hero.inventory.filter(eq => eq.id !== equipmentId);
    
    if (currentEquipped) {
      updatedInventory.push(currentEquipped);
    }

    const updatedEquipment = {
      ...hero.equipment,
      [equipment.slot]: equipment
    };

    await storage.updateHero(heroId, {
      inventory: updatedInventory,
      equipment: updatedEquipment
    });

    return { equipped: equipment, unequipped: currentEquipped };
  }

  async buyHonorShopItem(heroId: string, itemId: string): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const item = this.HONOR_SHOP_ITEMS[itemId as keyof typeof this.HONOR_SHOP_ITEMS];
    if (!item) {
      throw new Error("Item not found in honor shop");
    }

    if (hero.honorPoints < item.cost) {
      throw new Error("Insufficient honor points");
    }

    let updatedHero: any = {
      honorPoints: hero.honorPoints - item.cost
    };

    if (item.type === "equipment") {
      const equipment: Equipment = {
        id: `eq_${Date.now()}`,
        name: item.name,
        slot: item.slot,
        rarity: item.rarity as any,
        enhanceLevel: 0,
        stats: item.stats,
        acquiredAt: Date.now()
      };

      updatedHero.inventory = [...hero.inventory, equipment];
    }

    await storage.updateHero(heroId, updatedHero);
    return { item, cost: item.cost };
  }

  async calculateOfflineRewards(heroId: string, lastActiveTime: number): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const offlineTime = Math.floor((Date.now() - lastActiveTime) / 1000);
    const cappedTime = Math.min(offlineTime, 8 * 3600); // Max 8 hours
    const hours = cappedTime / 3600;

    const goldPerHour = 30 + hero.level * 8;
    const expPerHour = 60 + hero.level * 15;
    const efficiency = Math.max(0.3, 1 - Math.max(0, hours - 2) * 0.1);

    const rewards = {
      offlineTime: cappedTime,
      gold: Math.floor(goldPerHour * hours * efficiency),
      experience: Math.floor(expPerHour * hours * efficiency),
      materials: {}
    };

    return rewards;
  }

  async claimOfflineRewards(heroId: string, rewards: any, useAdBonus: boolean = false): Promise<any> {
    const hero = await storage.getHero(heroId);
    if (!hero) {
      throw new Error("Hero not found");
    }

    const multiplier = useAdBonus ? 2.0 : 1.0;
    const finalGold = Math.floor(rewards.gold * multiplier);
    const finalExp = Math.floor(rewards.experience * multiplier);

    let updatedHero = {
      gold: hero.gold + finalGold,
      experience: hero.experience + finalExp,
      lastActive: Date.now()
    };

    await storage.updateHero(heroId, updatedHero);
    return { 
      goldGained: finalGold, 
      experienceGained: finalExp,
      bonusApplied: useAdBonus 
    };
  }

  async startCrafting(heroId: string, recipeId: string): Promise<any> {
    return this.craftEquipment(heroId, recipeId);
  }

  async getGlobalStats(): Promise<any> {
    // Return mock global statistics
    return {
      totalPlayers: 1247,
      totalHeroes: 1583,
      totalBattles: 45629,
      averageLevel: 12.4,
      topRank: 1,
      totalGoldSpent: 2847593
    };
  }

  private generateEnemy(playerLevel: number): any {
    const enemyTypes = [
      { name: "Goblin", multiplier: 0.8 },
      { name: "Orc", multiplier: 1.0 },
      { name: "Skeleton", multiplier: 0.9 },
      { name: "Wolf", multiplier: 0.7 },
      { name: "Bandit", multiplier: 1.1 }
    ];

    const enemyTemplate = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const level = Math.max(1, playerLevel + Math.floor((Math.random() - 0.5) * 3));
    
    return {
      id: `enemy_${Date.now()}`,
      name: `${enemyTemplate.name} (Lv.${level})`,
      level,
      maxHealth: Math.floor((80 + level * 15) * enemyTemplate.multiplier),
      currentHealth: Math.floor((80 + level * 15) * enemyTemplate.multiplier),
      attack: Math.floor((8 + level * 2) * enemyTemplate.multiplier),
      defense: Math.floor((5 + level * 1) * enemyTemplate.multiplier),
      rewards: {
        experience: 20 + level * 5,
        gold: 10 + level * 3
      }
    };
  }
}

export const gameLogic = new GameLogic();
