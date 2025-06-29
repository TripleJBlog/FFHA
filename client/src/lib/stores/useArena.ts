import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useHero } from "./useHero";

export interface ArenaOpponent {
  id: string;
  name: string;
  level: number;
  class: string;
  rank: number;
  attack: number;
  defense: number;
  health: number;
}

export interface BattleResult {
  victory: boolean;
  honorGained: number;
  rankChange: number;
  experienceGained: number;
}

interface LeaderboardPlayer {
  id: string;
  name: string;
  level: number;
  rank: number;
  honor: number;
}

interface ArenaState {
  playerRank: number;
  honorPoints: number;
  currentOpponent: ArenaOpponent | null;
  battleInProgress: boolean;
  battleResult: BattleResult | null;
  leaderboard: LeaderboardPlayer[];
  
  // Actions
  findOpponent: (playerLevel: number, playerRank: number) => void;
  startBattle: (player: any, opponent: ArenaOpponent) => void;
  buyHonorItem: (item: any) => void;
  clearBattleResult: () => void;
  updateLeaderboard: () => void;
}

export const useArena = create<ArenaState>()(
  persist(
    (set, get) => ({
      playerRank: 5000,
      honorPoints: 0,
      currentOpponent: null,
      battleInProgress: false,
      battleResult: null,
      leaderboard: [],

      findOpponent: (playerLevel: number, playerRank: number) => {
        // Generate a random opponent near player's rank
        const rankVariance = Math.floor(playerRank * 0.1) || 100;
        const opponentRank = Math.max(1, playerRank + (Math.random() - 0.5) * rankVariance * 2);
        
        const opponentLevel = Math.max(1, playerLevel + Math.floor((Math.random() - 0.5) * 4));
        
        const opponentNames = [
          "Shadow Warrior", "Iron Knight", "Flame Mage", "Storm Guardian",
          "Crystal Hunter", "Dark Paladin", "Wind Assassin", "Earth Shaman",
          "Lightning Archer", "Frost Berserker", "Void Sorcerer", "Blood Champion"
        ];
        
        const classes = ["Warrior", "Guardian", "Mage"];
        const selectedClass = classes[Math.floor(Math.random() * classes.length)];
        
        // Calculate stats based on level and rank
        const baseStats = {
          Warrior: { attack: 15, defense: 10, health: 120 },
          Guardian: { attack: 10, defense: 15, health: 150 },
          Mage: { attack: 18, defense: 8, health: 100 }
        };
        
        const classStats = baseStats[selectedClass as keyof typeof baseStats];
        const statMultiplier = 1 + (opponentLevel - 1) * 0.1;
        const rankBonus = Math.max(0, (5000 - opponentRank) / 5000) * 0.5;
        
        const opponent: ArenaOpponent = {
          id: `opponent_${Date.now()}`,
          name: opponentNames[Math.floor(Math.random() * opponentNames.length)],
          level: opponentLevel,
          class: selectedClass,
          rank: Math.floor(opponentRank),
          attack: Math.floor(classStats.attack * statMultiplier * (1 + rankBonus)),
          defense: Math.floor(classStats.defense * statMultiplier * (1 + rankBonus)),
          health: Math.floor(classStats.health * statMultiplier * (1 + rankBonus))
        };

        set({ currentOpponent: opponent });
      },

      startBattle: (player: any, opponent: ArenaOpponent) => {
        set({ battleInProgress: true });

        // Simulate battle after 2 seconds
        setTimeout(() => {
          const playerPower = player.attack + player.defense + player.maxHealth / 10;
          const opponentPower = opponent.attack + opponent.defense + opponent.health / 10;
          
          // Add some randomness to battle outcome
          const playerRoll = playerPower * (0.8 + Math.random() * 0.4);
          const opponentRoll = opponentPower * (0.8 + Math.random() * 0.4);
          
          const victory = playerRoll > opponentRoll;
          
          // Calculate rewards/penalties
          const { playerRank } = get();
          const rankDifference = opponent.rank - playerRank;
          
          let honorGained: number;
          let rankChange: number;
          
          if (victory) {
            honorGained = Math.max(5, 15 + Math.floor(rankDifference / 100));
            rankChange = Math.max(1, Math.floor(rankDifference / 50));
            if (rankChange > 0) rankChange = Math.min(rankChange, Math.floor(opponent.rank - playerRank) / 2);
          } else {
            honorGained = Math.max(-10, -5 + Math.floor(rankDifference / 200));
            rankChange = Math.max(-10, Math.floor(rankDifference / 100));
          }
          
          const experienceGained = victory ? 50 + opponent.level * 5 : 20 + opponent.level * 2;
          
          // Update player stats
          const { gainExperience } = useHero.getState();
          gainExperience(experienceGained);
          
          set((state) => ({
            playerRank: Math.max(1, state.playerRank - rankChange),
            honorPoints: Math.max(0, state.honorPoints + honorGained),
            battleInProgress: false,
            battleResult: {
              victory,
              honorGained,
              rankChange,
              experienceGained
            },
            currentOpponent: null
          }));
          
        }, 2000);
      },

      buyHonorItem: (item: any) => {
        const { honorPoints } = get();
        
        if (honorPoints < item.cost) return;
        
        set((state) => ({
          honorPoints: state.honorPoints - item.cost
        }));

        // Handle different item types
        if (item.type === "equipment") {
          const { addEquipment } = useEquipment.getState();
          addEquipment({
            name: item.name,
            slot: item.slot,
            rarity: item.rarity,
            enhanceLevel: 0,
            stats: item.stats
          });
        } else if (item.type === "materials") {
          const { addMaterials } = useWorkshop.getState();
          addMaterials(item.materials);
        } else if (item.type === "gold") {
          const { gainGold } = useHero.getState();
          gainGold(item.amount);
        }
      },

      clearBattleResult: () => {
        set({ battleResult: null });
      },

      updateLeaderboard: () => {
        const { selectedHero } = useHero.getState();
        const { playerRank, honorPoints } = get();
        
        if (!selectedHero) return;

        // Generate fake leaderboard data
        const fakePlayerNames = [
          "DragonSlayer", "ShadowMaster", "IronLord", "StormKing", "FlameEmperor",
          "CrystalGuard", "VoidHunter", "ThunderGod", "FrostQueen", "BloodKnight"
        ];
        
        const leaderboard: LeaderboardPlayer[] = [];
        
        // Add player to leaderboard
        leaderboard.push({
          id: selectedHero.id,
          name: selectedHero.name,
          level: selectedHero.level,
          rank: playerRank,
          honor: honorPoints
        });
        
        // Generate other players
        for (let i = 0; i < 20; i++) {
          const rank = i + 1;
          if (rank === playerRank) continue; // Skip player's rank
          
          leaderboard.push({
            id: `fake_${i}`,
            name: fakePlayerNames[Math.floor(Math.random() * fakePlayerNames.length)],
            level: Math.max(1, selectedHero.level + Math.floor((Math.random() - 0.5) * 10)),
            rank: rank,
            honor: Math.max(0, honorPoints + (playerRank - rank) * 10 + Math.floor(Math.random() * 100))
          });
        }
        
        // Sort by rank
        leaderboard.sort((a, b) => a.rank - b.rank);
        
        set({ leaderboard });
      }
    }),
    {
      name: "arena-storage"
    }
  )
);

// Update leaderboard periodically
setInterval(() => {
  useArena.getState().updateLeaderboard();
}, 30000);
