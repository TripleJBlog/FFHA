export const HERO_CLASSES = [
  {
    name: "Warrior",
    description: "Strong melee fighter with high attack and health",
    baseStats: {
      attack: 15,
      defense: 10,
      health: 120
    }
  },
  {
    name: "Guardian",
    description: "Defensive tank with high defense and health",
    baseStats: {
      attack: 10,
      defense: 15,
      health: 150
    }
  },
  {
    name: "Mage",
    description: "Magical damage dealer with high attack but low health",
    baseStats: {
      attack: 18,
      defense: 8,
      health: 100
    }
  }
];

export const EQUIPMENT_SLOTS = [
  { id: "weapon", name: "Weapon" },
  { id: "armor", name: "Armor" },
  { id: "shield", name: "Shield" }
];

export const RARITY_COLORS = {
  Common: "bg-gray-600 text-gray-100",
  Rare: "bg-blue-600 text-blue-100",
  Epic: "bg-purple-600 text-purple-100",
  Legendary: "bg-yellow-600 text-yellow-100"
};

export const CRAFTABLE_ITEMS = [
  // Weapons
  {
    id: "iron_sword",
    name: "Iron Sword",
    category: "weapons",
    slot: "weapon",
    rarity: "Common",
    craftTime: 30000, // 30 seconds
    goldCost: 100,
    materials: [
      { type: "ironOre", amount: 3 },
      { type: "wood", amount: 1 }
    ],
    stats: { attack: 12, defense: 0, health: 0 }
  },
  {
    id: "steel_blade",
    name: "Steel Blade",
    category: "weapons",
    slot: "weapon",
    rarity: "Rare",
    craftTime: 60000, // 1 minute
    goldCost: 250,
    materials: [
      { type: "ironOre", amount: 5 },
      { type: "crystals", amount: 1 }
    ],
    stats: { attack: 20, defense: 2, health: 0 }
  },
  {
    id: "enchanted_sword",
    name: "Enchanted Sword",
    category: "weapons",
    slot: "weapon",
    rarity: "Epic",
    craftTime: 120000, // 2 minutes
    goldCost: 500,
    materials: [
      { type: "ironOre", amount: 8 },
      { type: "crystals", amount: 3 },
      { type: "gems", amount: 1 }
    ],
    stats: { attack: 35, defense: 5, health: 10 }
  },

  // Armor
  {
    id: "leather_armor",
    name: "Leather Armor",
    category: "armor",
    slot: "armor",
    rarity: "Common",
    craftTime: 45000, // 45 seconds
    goldCost: 80,
    materials: [
      { type: "leather", amount: 4 },
      { type: "cloth", amount: 2 }
    ],
    stats: { attack: 0, defense: 8, health: 20 }
  },
  {
    id: "chain_mail",
    name: "Chain Mail",
    category: "armor",
    slot: "armor",
    rarity: "Rare",
    craftTime: 90000, // 1.5 minutes
    goldCost: 200,
    materials: [
      { type: "ironOre", amount: 6 },
      { type: "leather", amount: 2 }
    ],
    stats: { attack: 2, defense: 15, health: 35 }
  },
  {
    id: "plate_armor",
    name: "Plate Armor",
    category: "armor",
    slot: "armor",
    rarity: "Epic",
    craftTime: 180000, // 3 minutes
    goldCost: 450,
    materials: [
      { type: "ironOre", amount: 10 },
      { type: "crystals", amount: 2 },
      { type: "leather", amount: 3 }
    ],
    stats: { attack: 5, defense: 25, health: 60 }
  },

  // Shields
  {
    id: "wooden_shield",
    name: "Wooden Shield",
    category: "shields",
    slot: "shield",
    rarity: "Common",
    craftTime: 20000, // 20 seconds
    goldCost: 60,
    materials: [
      { type: "wood", amount: 3 },
      { type: "leather", amount: 1 }
    ],
    stats: { attack: 0, defense: 6, health: 15 }
  },
  {
    id: "iron_shield",
    name: "Iron Shield",
    category: "shields",
    slot: "shield",
    rarity: "Rare",
    craftTime: 75000, // 1.25 minutes
    goldCost: 180,
    materials: [
      { type: "ironOre", amount: 4 },
      { type: "wood", amount: 2 }
    ],
    stats: { attack: 1, defense: 12, health: 25 }
  },
  {
    id: "crystal_shield",
    name: "Crystal Shield",
    category: "shields",
    slot: "shield",
    rarity: "Epic",
    craftTime: 150000, // 2.5 minutes
    goldCost: 400,
    materials: [
      { type: "crystals", amount: 4 },
      { type: "ironOre", amount: 3 },
      { type: "gems", amount: 1 }
    ],
    stats: { attack: 3, defense: 20, health: 40 }
  }
];

export const HONOR_SHOP_ITEMS = [
  {
    id: "honor_sword",
    name: "Honor Blade",
    type: "equipment",
    slot: "weapon",
    rarity: "Legendary",
    cost: 500,
    description: "A legendary weapon forged from arena victories",
    stats: { attack: 50, defense: 8, health: 20 }
  },
  {
    id: "honor_armor",
    name: "Champion's Plate",
    type: "equipment",
    slot: "armor",
    rarity: "Legendary",
    cost: 750,
    description: "Armor worn by arena champions",
    stats: { attack: 8, defense: 40, health: 100 }
  },
  {
    id: "rare_materials",
    name: "Rare Material Pack",
    type: "materials",
    cost: 200,
    description: "A collection of rare crafting materials",
    materials: {
      crystals: 5,
      gems: 3,
      ironOre: 10
    }
  },
  {
    id: "gold_bag",
    name: "Bag of Gold",
    type: "gold",
    cost: 100,
    description: "A hefty bag containing 1000 gold",
    amount: 1000
  },
  {
    id: "enhancement_stones",
    name: "Enhancement Stones",
    type: "materials",
    cost: 300,
    description: "Special stones that boost equipment enhancement",
    materials: {
      gems: 10,
      crystals: 15
    }
  }
];
