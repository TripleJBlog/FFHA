/**
 * Game utility functions for calculations and formatting
 */

export const GAME_CONFIG = {
  COMBAT_INTERVAL: 3000, // 3 seconds between combat rounds
  MAX_OFFLINE_HOURS: 8, // Maximum offline progression hours
  ENHANCEMENT_MAX_LEVEL: 10,
  LEVEL_EXP_MULTIPLIER: 100, // Base EXP needed per level
  ARENA_RANK_VARIANCE: 0.1, // 10% rank variance for opponents
  AD_BONUS_MULTIPLIER: 2.0, // 2x bonus for watching ads
};

/**
 * Calculate experience required for next level
 */
export function calculateExpToNextLevel(level: number): number {
  return level * GAME_CONFIG.LEVEL_EXP_MULTIPLIER;
}

/**
 * Calculate total experience gained from level 1 to target level
 */
export function calculateTotalExpForLevel(level: number): number {
  let totalExp = 0;
  for (let i = 1; i < level; i++) {
    totalExp += calculateExpToNextLevel(i);
  }
  return totalExp;
}

/**
 * Calculate combat damage between attacker and defender
 */
export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  randomFactor: number = 0.2
): number {
  const baseDamage = Math.max(1, attackerAttack - defenderDefense / 2);
  const variance = baseDamage * randomFactor;
  const finalDamage = baseDamage + (Math.random() - 0.5) * variance;
  return Math.floor(Math.max(1, finalDamage));
}

/**
 * Calculate battle outcome probability
 */
export function calculateWinProbability(
  playerPower: number,
  enemyPower: number
): number {
  const ratio = playerPower / (playerPower + enemyPower);
  // Add some randomness to make battles more interesting
  return Math.max(0.1, Math.min(0.9, ratio));
}

/**
 * Calculate power rating for a character
 */
export function calculatePowerRating(stats: {
  attack: number;
  defense: number;
  health: number;
}): number {
  return stats.attack * 2 + stats.defense * 1.5 + stats.health * 0.1;
}

/**
 * Format time duration to human readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

/**
 * Format large numbers with appropriate suffixes
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Calculate offline rewards based on time away and player level
 */
export function calculateOfflineRewards(
  offlineTimeSeconds: number,
  playerLevel: number,
  playerPower: number
): {
  gold: number;
  experience: number;
  materials: Record<string, number>;
} {
  // Cap offline time to maximum hours
  const cappedTime = Math.min(offlineTimeSeconds, GAME_CONFIG.MAX_OFFLINE_HOURS * 3600);
  const hours = cappedTime / 3600;

  // Base rewards per hour scale with level
  const goldPerHour = 30 + playerLevel * 8 + Math.floor(playerPower / 10);
  const expPerHour = 60 + playerLevel * 15 + Math.floor(playerPower / 20);

  // Apply diminishing returns for longer offline periods
  const efficiency = Math.max(0.3, 1 - Math.max(0, hours - 2) * 0.1);

  const gold = Math.floor(goldPerHour * hours * efficiency);
  const experience = Math.floor(expPerHour * hours * efficiency);

  // Calculate random materials
  const materials: Record<string, number> = {};
  const materialTypes = ["ironOre", "leather", "cloth", "wood", "crystals"];
  
  materialTypes.forEach(material => {
    const baseChance = material === "crystals" ? 0.2 : 0.4;
    const chance = Math.min(0.8, baseChance + hours * 0.1);
    
    if (Math.random() < chance) {
      const baseAmount = material === "crystals" ? 1 : 2;
      materials[material] = Math.floor(Math.random() * Math.max(1, hours * baseAmount)) + 1;
    }
  });

  return { gold, experience, materials };
}

/**
 * Calculate enhancement cost for equipment
 */
export function calculateEnhancementCost(currentLevel: number): number {
  return (currentLevel + 1) * 100 + Math.floor(Math.pow(currentLevel, 1.5) * 50);
}

/**
 * Calculate arena honor rewards based on rank difference
 */
export function calculateArenaRewards(
  victory: boolean,
  playerRank: number,
  opponentRank: number,
  playerLevel: number
): {
  honorGained: number;
  rankChange: number;
  experienceGained: number;
} {
  const rankDifference = opponentRank - playerRank;
  
  let honorGained: number;
  let rankChange: number;
  const experienceGained = victory ? 40 + playerLevel * 3 : 15 + playerLevel;

  if (victory) {
    // Reward more for beating higher ranked opponents
    honorGained = Math.max(5, 15 + Math.floor(rankDifference / 100));
    rankChange = Math.max(1, Math.floor(Math.abs(rankDifference) / 50));
    
    // Cap rank change to prevent huge jumps
    if (rankChange > 0) {
      rankChange = Math.min(rankChange, Math.floor((playerRank - opponentRank) / 2));
    }
  } else {
    // Lose less honor when fighting stronger opponents
    honorGained = Math.max(-10, -5 + Math.floor(rankDifference / 200));
    rankChange = Math.min(-1, Math.floor(rankDifference / 100));
  }

  return { honorGained, rankChange: -rankChange, experienceGained };
}

/**
 * Generate random enemy for idle combat
 */
export function generateRandomEnemy(playerLevel: number): {
  name: string;
  level: number;
  type: string;
  stats: { attack: number; defense: number; health: number };
  rewards: { experience: number; gold: number; materials?: Record<string, number> };
} {
  const enemyTypes = [
    { name: "Goblin Scout", type: "Monster", multiplier: 0.7, color: "green" },
    { name: "Orc Warrior", type: "Monster", multiplier: 1.0, color: "red" },
    { name: "Skeleton Archer", type: "Undead", multiplier: 0.8, color: "gray" },
    { name: "Forest Wolf", type: "Beast", multiplier: 0.6, color: "brown" },
    { name: "Bandit Rogue", type: "Human", multiplier: 1.1, color: "black" },
    { name: "Cave Troll", type: "Monster", multiplier: 1.4, color: "purple" },
    { name: "Dark Cultist", type: "Magic", multiplier: 1.2, color: "violet" },
    { name: "Stone Golem", type: "Construct", multiplier: 1.3, color: "gray" },
    { name: "Fire Imp", type: "Demon", multiplier: 0.9, color: "orange" },
    { name: "Ice Elemental", type: "Elemental", multiplier: 1.1, color: "blue" }
  ];

  const enemyTemplate = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const levelVariance = Math.floor((Math.random() - 0.5) * 4); // ±2 levels
  const level = Math.max(1, playerLevel + levelVariance);
  
  // Base stats scale with level
  const baseHealth = 60 + level * 12;
  const baseAttack = 6 + level * 2;
  const baseDefense = 4 + level * 1;

  // Apply enemy type multiplier
  const stats = {
    health: Math.floor(baseHealth * enemyTemplate.multiplier),
    attack: Math.floor(baseAttack * enemyTemplate.multiplier),
    defense: Math.floor(baseDefense * enemyTemplate.multiplier)
  };

  // Calculate rewards
  const baseExp = 15 + level * 4;
  const baseGold = 8 + level * 2;
  
  const rewards = {
    experience: Math.floor(baseExp * enemyTemplate.multiplier),
    gold: Math.floor(baseGold * enemyTemplate.multiplier),
    materials: Math.random() < 0.25 ? {
      [["ironOre", "leather", "cloth", "wood"][Math.floor(Math.random() * 4)]]: 1
    } : undefined
  };

  return {
    name: `${enemyTemplate.name} (Lv.${level})`,
    level,
    type: enemyTemplate.type,
    stats,
    rewards
  };
}

/**
 * Validate game state for anti-cheat measures
 */
export function validateGameState(hero: any): boolean {
  if (!hero) return false;
  
  // Check basic constraints
  if (hero.level < 1 || hero.level > 1000) return false;
  if (hero.experience < 0) return false;
  if (hero.gold < 0) return false;
  if (hero.currentHealth < 0 || hero.currentHealth > hero.maxHealth) return false;
  
  // Check stat progression makes sense
  const expectedMinStats = hero.level * 2;
  if (hero.attack < expectedMinStats || hero.defense < expectedMinStats) return false;
  
  return true;
}

/**
 * Calculate skill point allocation
 */
export function calculateSkillPoints(level: number, spentPoints: number): number {
  const totalAvailable = Math.floor(level / 5); // 1 point every 5 levels
  return Math.max(0, totalAvailable - spentPoints);
}

/**
 * Get rarity color class for UI
 */
export function getRarityColor(rarity: string): string {
  const colors = {
    Common: "text-gray-400 border-gray-400",
    Rare: "text-blue-400 border-blue-400", 
    Epic: "text-purple-400 border-purple-400",
    Legendary: "text-yellow-400 border-yellow-400"
  };
  return colors[rarity as keyof typeof colors] || colors.Common;
}

/**
 * Calculate item sell value
 */
export function calculateSellValue(
  baseValue: number,
  rarity: string,
  enhanceLevel: number
): number {
  const rarityMultipliers = {
    Common: 0.3,
    Rare: 0.4,
    Epic: 0.5,
    Legendary: 0.6
  };
  
  const rarityMultiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 0.3;
  const enhanceMultiplier = 1 + (enhanceLevel * 0.1);
  
  return Math.floor(baseValue * rarityMultiplier * enhanceMultiplier);
}
